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

export default async function ReviewUsersPage() {
  const user = await getCurrentUser();
  if (!user) redirect('/login');

  const context = await getApproverContext(user);
  if (!context || context.basis === GRANT_BASIS_RM) notFound();

  const users = groupManagedUsers(
    await listProviderGrants(context.providerCode),
    context,
    user.id
  ).filter((u) => u.status !== 'Removed');

  return (
    <Layout
      title="Review who has access"
      showLoginInformation={true}
      currentPage="review-users"
    >
      <Link href="/manage-users" className="govuk-back-link">
        Back
      </Link>
      <span className="govuk-caption-l">{context.providerName}</span>
      <h1 className="govuk-heading-l">Review who has access</h1>
      <div className="govuk-grid-row">
        <div className="govuk-grid-column-two-thirds">
          <p className="govuk-body">
            Make sure everyone on this list still needs access. Remove anyone
            who has left your organisation or has changed roles.
          </p>
          <p className="govuk-body">
            When you confirm the list, nobody else who manages access for{' '}
            {context.providerName} will need to check it this year.
          </p>
        </div>
      </div>

      {users.length > 0 ? (
        <UsersTable users={users} />
      ) : (
        <p className="govuk-body">Nobody else has access at the moment.</p>
      )}

      <ConfirmUserReview />
    </Layout>
  );
}
