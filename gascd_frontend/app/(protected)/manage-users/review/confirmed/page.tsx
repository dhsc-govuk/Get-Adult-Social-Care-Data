import { notFound, redirect } from 'next/navigation';
import Link from 'next/link';
import Layout from '@/components/common/layout/Layout';
import { getCurrentUser } from '@/lib/permissions';
import { getApproverContext } from '@/lib/manageUsersServer';
import { getUserReview } from '@/lib/accessReviewServer';
import { formatReviewMonth } from '@/lib/accessReview';
import { GRANT_BASIS_RM } from '@/lib/manageUsers';

export default async function UserReviewConfirmedPage() {
  const user = await getCurrentUser();
  if (!user) redirect('/login');

  const context = await getApproverContext(user);
  if (!context) notFound();
  const review = await getUserReview(context);
  const isRm = context.basis === GRANT_BASIS_RM;

  return (
    <Layout
      title="List confirmed"
      showLoginInformation={true}
      currentPage="review-users-confirmed"
    >
      <div className="govuk-grid-row">
        <div className="govuk-grid-column-two-thirds">
          <div className="govuk-panel govuk-panel--confirmation">
            <h1 className="govuk-panel__title">List confirmed</h1>
            <div className="govuk-panel__body">
              You have confirmed who has access is up to date
            </div>
          </div>

          <h2 className="govuk-heading-m">What happens next</h2>
          {review && (
            <p className="govuk-body">
              We will ask you to check it again in{' '}
              {formatReviewMonth(review.dueAt)}.
            </p>
          )}
          <p className="govuk-body">
            {isRm
              ? 'Nobody else who manages access to your locations needs to check them before then.'
              : `Nobody else who manages access for ${context.providerName} needs to check it before then.`}
          </p>
          <p className="govuk-body">
            You are responsible for keeping this list up to date. Remove anyone
            who no longer needs access, for example when they leave or change
            roles.
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
