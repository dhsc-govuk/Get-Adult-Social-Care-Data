import { notFound, redirect } from 'next/navigation';
import Link from 'next/link';
import Layout from '@/components/common/layout/Layout';
import { getCurrentUser } from '@/lib/permissions';
import {
  getApproverContext,
  listProviderGrants,
} from '@/lib/manageUsersServer';
import { GRANT_BASIS_RM, groupManagedUsers } from '@/lib/manageUsers';
import UsersTable from '../UsersTable';
import ConfirmUserReview from './ConfirmUserReview';

const DONE_MESSAGES: Record<string, (name: string) => string> = {
  removed: (name) => `${name}'s access has been removed`,
  cancelled: (name) => `The invite to ${name} has been cancelled`,
};

type Props = {
  searchParams: Promise<{ done?: string; user?: string }>;
};

export default async function ReviewUsersPage({ searchParams }: Props) {
  const user = await getCurrentUser();
  if (!user) redirect('/login');

  const context = await getApproverContext(user);
  if (!context) notFound();
  const isRm = context.basis === GRANT_BASIS_RM;

  const { done, user: changedUserId } = await searchParams;
  const grants = await listProviderGrants(context.providerCode);
  const users = groupManagedUsers(grants, context, user.id).filter(
    (u) => u.status !== 'Removed'
  );
  const changedUser =
    changedUserId && done && Object.hasOwn(DONE_MESSAGES, done)
      ? groupManagedUsers(grants, context, user.id, new Date(), true).find(
          (u) => u.userId === changedUserId
        )
      : undefined;
  const scopeName = isRm
    ? context.locations.map((location) => location.name).join(', ')
    : context.providerName;

  return (
    <Layout
      title="Review who has access"
      showLoginInformation={true}
      currentPage="review-users"
    >
      <Link href="/manage-users" className="govuk-back-link">
        Back
      </Link>
      {changedUser && done && (
        <div className="govuk-grid-row">
          <div className="govuk-grid-column-two-thirds">
            <div
              className="govuk-notification-banner govuk-notification-banner--success"
              role="alert"
              aria-labelledby="review-change-title"
              data-module="govuk-notification-banner"
            >
              <div className="govuk-notification-banner__header">
                <h2
                  className="govuk-notification-banner__title"
                  id="review-change-title"
                >
                  Success
                </h2>
              </div>
              <div className="govuk-notification-banner__content">
                <p className="govuk-notification-banner__heading">
                  {DONE_MESSAGES[done](changedUser.name)}
                </p>
              </div>
            </div>
          </div>
        </div>
      )}
      <span className="govuk-caption-l">{scopeName}</span>
      <h1 className="govuk-heading-l">Review who has access</h1>
      <div className="govuk-grid-row">
        <div className="govuk-grid-column-two-thirds">
          <p className="govuk-body">
            Make sure everyone on this list still needs access. Remove anyone
            who has left your organisation or has changed roles.
          </p>
          <p className="govuk-body">
            {isRm
              ? 'When you confirm the list, nobody else who manages access to your locations will need to check them this year.'
              : `When you confirm the list, nobody else who manages access for ${context.providerName} will need to check it this year.`}
          </p>
        </div>
      </div>

      {users.length > 0 ? (
        <UsersTable users={users} reviewing />
      ) : (
        <p className="govuk-body">Nobody else has access at the moment.</p>
      )}

      <ConfirmUserReview />
    </Layout>
  );
}
