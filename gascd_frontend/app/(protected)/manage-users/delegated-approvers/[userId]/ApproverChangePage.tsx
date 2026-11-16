import { notFound, redirect } from 'next/navigation';
import Link from 'next/link';
import Layout from '@/components/common/layout/Layout';
import { getCurrentUser } from '@/lib/permissions';
import { getChangeableApprover } from '@/lib/manageUsersServer';
import { DelegatedApprover, INVITE_EXPIRY_DAYS } from '@/lib/manageUsers';
import ConfirmApproverChange from './ConfirmApproverChange';

type Kind = 'remove' | 'resend' | 'cancel';

const PAGES: Record<
  Kind,
  {
    title: string;
    allowed: (approver: DelegatedApprover) => boolean;
    heading: (approver: DelegatedApprover) => string;
    body: (approver: DelegatedApprover) => string[];
  }
> = {
  remove: {
    title: 'Remove delegated approver',
    allowed: (approver) => approver.status === 'Active',
    heading: (approver) =>
      `Are you sure you want to remove ${approver.name} as a delegated approver?`,
    body: () => [
      'They will no longer be able to give or remove access to your organisation’s data.',
      'They will still be able to view your organisation’s data. Anyone they gave access to will keep their access.',
      'We will email them to let them know.',
    ],
  },
  resend: {
    title: 'Resend invite',
    allowed: (approver) => approver.status !== 'Active',
    heading: (approver) => `Resend ${approver.name}'s invite?`,
    body: (approver) => [
      `We will send a new email to ${approver.email}. They will have ${INVITE_EXPIRY_DAYS} days from today to sign in.`,
    ],
  },
  cancel: {
    title: 'Cancel invite',
    allowed: (approver) => approver.status !== 'Active',
    heading: (approver) =>
      `Are you sure you want to cancel ${approver.name}'s invite to be a delegated approver?`,
    body: () => [
      'They will not be able to give or remove access to your organisation’s data.',
    ],
  },
};

export default async function ApproverChangePage({
  params,
  kind,
}: {
  params: Promise<{ userId: string }>;
  kind: Kind;
}) {
  const actor = await getCurrentUser();
  if (!actor) redirect('/login');

  const { userId } = await params;
  const changeable = await getChangeableApprover(actor, userId);
  const page = PAGES[kind];
  if (!changeable || !page.allowed(changeable.approver)) notFound();
  const { approver } = changeable;

  return (
    <Layout
      title={page.title}
      showLoginInformation={true}
      currentPage={`approver-${kind}`}
    >
      <Link href="/manage-users" className="govuk-back-link">
        Back
      </Link>
      <div className="govuk-grid-row">
        <div className="govuk-grid-column-two-thirds">
          <span className="govuk-caption-l">{approver.email}</span>
          <h1 className="govuk-heading-l">{page.heading(approver)}</h1>
          {page.body(approver).map((text) => (
            <p className="govuk-body" key={text}>
              {text}
            </p>
          ))}
          <ConfirmApproverChange userId={approver.userId} kind={kind} />
        </div>
      </div>
    </Layout>
  );
}
