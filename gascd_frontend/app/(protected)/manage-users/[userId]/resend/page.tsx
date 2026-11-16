import { notFound, redirect } from 'next/navigation';
import Link from 'next/link';
import Layout from '@/components/common/layout/Layout';
import { getCurrentUser } from '@/lib/permissions';
import { getChangeableUser } from '@/lib/manageUsersServer';
import { INVITE_EXPIRY_DAYS } from '@/lib/manageUsers';
import ConfirmChange from '../ConfirmChange';

type Props = { params: Promise<{ userId: string }> };

export default async function ResendInvitePage({ params }: Props) {
  const actor = await getCurrentUser();
  if (!actor) redirect('/login');

  const { userId } = await params;
  const changeable = await getChangeableUser(actor, userId);
  if (
    !changeable ||
    !changeable.user.canRemove ||
    (changeable.user.status !== 'Invited' &&
      changeable.user.status !== 'Invite expired')
  ) {
    notFound();
  }
  const { user } = changeable;

  return (
    <Layout
      title="Resend invite"
      showLoginInformation={true}
      currentPage="resend-invite"
    >
      <Link href="/manage-users" className="govuk-back-link">
        Back
      </Link>
      <div className="govuk-grid-row">
        <div className="govuk-grid-column-two-thirds">
          <span className="govuk-caption-l">{user.email}</span>
          <h1 className="govuk-heading-l">Resend {user.name}&apos;s invite?</h1>
          <p className="govuk-body">
            We will send a new email to {user.email}. They will have{' '}
            {INVITE_EXPIRY_DAYS} days from today to sign in.
          </p>
          <ConfirmChange userId={user.userId} kind="resend" />
        </div>
      </div>
    </Layout>
  );
}
