import { notFound, redirect } from 'next/navigation';
import Link from 'next/link';
import Layout from '@/components/common/layout/Layout';
import { getCurrentUser } from '@/lib/permissions';
import { getChangeableApprover } from '@/lib/manageUsersServer';
import { INVITE_EXPIRY_DAYS } from '@/lib/manageUsers';
import { SIGN_IN_URL } from '@/lib/signInUrl';

const formatDate = (date: Date) =>
  date.toLocaleDateString('en-GB', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
    timeZone: 'Europe/London',
  });

type Props = {
  searchParams: Promise<{ user?: string; email?: string }>;
};

export default async function ApproverAppointedPage({ searchParams }: Props) {
  const actor = await getCurrentUser();
  if (!actor) redirect('/login');

  const { user: userId, email: emailStatus } = await searchParams;
  const changeable = userId
    ? await getChangeableApprover(actor, String(userId))
    : null;
  if (!changeable) notFound();
  const { approver } = changeable;
  const invited = approver.status !== 'Active';
  const emailSent = emailStatus === 'sent';

  return (
    <Layout
      title="Delegated approver appointed"
      showLoginInformation={true}
      currentPage="approver-appointed"
    >
      <div className="govuk-grid-row">
        <div className="govuk-grid-column-two-thirds">
          <div className="govuk-panel govuk-panel--confirmation">
            <h1 className="govuk-panel__title">
              {invited
                ? 'Delegated approver invited'
                : 'Delegated approver appointed'}
            </h1>
            <div className="govuk-panel__body">
              {approver.name} ({approver.email})
            </div>
          </div>

          <h2 className="govuk-heading-m">What happens next</h2>
          {invited ? (
            <>
              <p className="govuk-body" data-testid="approver-email-status">
                {emailSent
                  ? `We've sent an email to ${approver.email} inviting them to sign in.`
                  : `We could not send them an email. Tell them to sign in at ${SIGN_IN_URL.replace(/^https?:\/\//, '')} using GOV.UK One Login with the email address ${approver.email}.`}
              </p>
              <p className="govuk-body">
                They have {INVITE_EXPIRY_DAYS} days to sign in
                {approver.inviteExpiresAt
                  ? `, until ${formatDate(approver.inviteExpiresAt)}`
                  : ''}
                . Once they have, they can give and remove access to any
                location in your organisation.
              </p>
            </>
          ) : (
            <>
              <p className="govuk-body" data-testid="approver-email-status">
                {emailSent
                  ? `We've sent an email to ${approver.email} to let them know.`
                  : `We could not send them an email, so let them know yourself.`}
              </p>
              <p className="govuk-body">
                They can now give and remove access to any location in your
                organisation.
              </p>
            </>
          )}
          <p className="govuk-body">
            You can remove their role at any time from the Manage users page.
          </p>
          <p className="govuk-body">
            <Link href="/manage-users" className="govuk-link">
              Return to Manage users
            </Link>
          </p>
        </div>
      </div>
    </Layout>
  );
}
