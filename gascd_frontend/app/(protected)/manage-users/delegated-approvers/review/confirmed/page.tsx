import { notFound, redirect } from 'next/navigation';
import Link from 'next/link';
import Layout from '@/components/common/layout/Layout';
import { getCurrentUser } from '@/lib/permissions';
import { getApproverContext } from '@/lib/manageUsersServer';
import { getReview } from '@/lib/accessReviewServer';
import { formatReviewMonth, REVIEW_TYPE_APPROVERS } from '@/lib/accessReview';
import { GRANT_BASIS_NI } from '@/lib/manageUsers';

type Props = { searchParams: Promise<{ removed?: string }> };

export default async function ApproverReviewConfirmedPage({
  searchParams,
}: Props) {
  const user = await getCurrentUser();
  if (!user) redirect('/login');

  const context = await getApproverContext(user);
  if (!context || context.basis !== GRANT_BASIS_NI) notFound();
  const review = await getReview(context.providerCode, REVIEW_TYPE_APPROVERS);
  const removed = Number.parseInt((await searchParams).removed ?? '0', 10) || 0;

  return (
    <Layout
      title="Review complete"
      showLoginInformation={true}
      currentPage="review-approvers-confirmed"
    >
      <div className="govuk-grid-row">
        <div className="govuk-grid-column-two-thirds">
          <div className="govuk-panel govuk-panel--confirmation">
            <h1 className="govuk-panel__title">Review complete</h1>
            <div className="govuk-panel__body">
              You have reviewed your delegated approvers
            </div>
          </div>

          <h2 className="govuk-heading-m">What happens next</h2>
          {removed > 0 && (
            <p className="govuk-body">
              {removed === 1
                ? '1 person is no longer a delegated approver. They'
                : `${removed} people are no longer delegated approvers. They`}{' '}
              can no longer give or remove access, but can still view your
              organisation&apos;s data, and anyone they gave access to keeps it.
              We have emailed them to let them know.
            </p>
          )}
          {review && (
            <p className="govuk-body">
              We will ask you to review them again in{' '}
              {formatReviewMonth(review.dueAt)}.
            </p>
          )}
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
