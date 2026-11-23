import { notFound, redirect } from 'next/navigation';
import Layout from '@/components/common/layout/Layout';
import { getCurrentUser } from '@/lib/permissions';
import {
  getApproverContext,
  listDelegatedApprovers,
} from '@/lib/manageUsersServer';
import { GRANT_BASIS_NI } from '@/lib/manageUsers';
import { getReview } from '@/lib/accessReviewServer';
import { REVIEW_TYPE_APPROVERS, reviewStatus } from '@/lib/accessReview';
import ApproverReviewForm from './ApproverReviewForm';

const formatDate = (date: Date) =>
  date.toLocaleDateString('en-GB', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
    timeZone: 'Europe/London',
  });

export default async function ReviewApproversPage() {
  const user = await getCurrentUser();
  if (!user) redirect('/login');

  const context = await getApproverContext(user);
  if (!context || context.basis !== GRANT_BASIS_NI) notFound();

  const approvers = await listDelegatedApprovers(context, user.id);
  if (approvers.length === 0) redirect('/manage-users');

  const status = reviewStatus(
    REVIEW_TYPE_APPROVERS,
    await getReview(context.providerCode, REVIEW_TYPE_APPROVERS)
  );

  return (
    <Layout
      title="Review delegated approvers"
      showLoginInformation={true}
      currentPage="review-approvers"
    >
      <div className="govuk-grid-row">
        <div className="govuk-grid-column-two-thirds">
          <ApproverReviewForm
            caption={context.providerName}
            warning={
              status?.due &&
              status.deadline && (
                <div className="govuk-warning-text">
                  <span className="govuk-warning-text__icon" aria-hidden="true">
                    !
                  </span>
                  <strong className="govuk-warning-text__text">
                    <span className="govuk-visually-hidden">Warning</span>
                    {status.overdue
                      ? 'The deadline for this review has passed. Complete it today, or these delegated approvers will no longer be able to give or remove access.'
                      : `Complete this review by ${formatDate(status.deadline)}. If nobody does, these delegated approvers will no longer be able to give or remove access.`}
                  </strong>
                </div>
              )
            }
            approvers={approvers.map(({ userId, name, email, status }) => ({
              userId,
              name,
              email,
              status,
            }))}
          />
        </div>
      </div>
    </Layout>
  );
}
