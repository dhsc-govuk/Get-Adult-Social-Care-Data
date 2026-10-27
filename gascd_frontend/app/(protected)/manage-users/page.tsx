import { notFound, redirect } from 'next/navigation';
import Link from 'next/link';
import Layout from '@/components/common/layout/Layout';
import { getCurrentUser } from '@/lib/permissions';
import {
  getApproverContext,
  listProviderGrants,
} from '@/lib/manageUsersServer';
import {
  APPROVER_DESCRIPTIONS,
  groupManagedUsers,
  MANAGE_USERS_PAGE_SIZE,
} from '@/lib/manageUsers';
import UsersTable from './UsersTable';
import UsersPagination from './UsersPagination';

type Props = {
  searchParams: Promise<{ page?: string; added?: string }>;
};

export default async function ManageUsersPage({ searchParams }: Props) {
  const user = await getCurrentUser();
  if (!user) redirect('/login');

  const context = await getApproverContext(user);
  if (!context) notFound();

  const { page, added } = await searchParams;
  const users = groupManagedUsers(
    await listProviderGrants(context.providerCode),
    context,
    user.id
  );
  const totalPages = Math.max(
    1,
    Math.ceil(users.length / MANAGE_USERS_PAGE_SIZE)
  );
  const currentPage = Math.min(
    Math.max(1, Number.parseInt(page ?? '1', 10) || 1),
    totalPages
  );
  const pageUsers = users.slice(
    (currentPage - 1) * MANAGE_USERS_PAGE_SIZE,
    currentPage * MANAGE_USERS_PAGE_SIZE
  );

  const addedUser = added && users.find((u) => u.userId === added);

  return (
    <Layout
      title="Manage users"
      showLoginInformation={true}
      currentPage="manage-users"
    >
      {addedUser && (
        <div
          className="govuk-notification-banner govuk-notification-banner--success"
          role="alert"
          aria-labelledby="user-added-title"
          data-module="govuk-notification-banner"
        >
          <div className="govuk-notification-banner__header">
            <h2
              className="govuk-notification-banner__title"
              id="user-added-title"
            >
              Success
            </h2>
          </div>
          <div className="govuk-notification-banner__content">
            <h3 className="govuk-notification-banner__heading">
              {addedUser.name} has been given access
            </h3>
            <p className="govuk-body">
              Tell them to sign in to Get adult social care data with GOV.UK One
              Login, using {addedUser.email}. We do not email them.
            </p>
          </div>
        </div>
      )}

      <span className="govuk-caption-l">{context.providerName}</span>
      <h1 className="govuk-heading-l">Manage users</h1>
      <div className="govuk-grid-row">
        <div className="govuk-grid-column-two-thirds">
          <p className="govuk-body">
            Choose which users in your organisation can access GASCD. You are
            responsible for keeping this list up to date.
          </p>
          <p className="govuk-body govuk-!-font-weight-bold">
            You are signed in as {APPROVER_DESCRIPTIONS[context.basis]}.{' '}
            {context.providerWide
              ? 'You can give access to any of your locations.'
              : 'You can give access to the locations you manage.'}
          </p>
        </div>
      </div>
      <Link href="/manage-users/invite" className="govuk-button">
        Invite a new user
      </Link>

      <UsersTable users={pageUsers} />
      {totalPages > 1 && (
        <UsersPagination currentPage={currentPage} totalPages={totalPages} />
      )}
    </Layout>
  );
}
