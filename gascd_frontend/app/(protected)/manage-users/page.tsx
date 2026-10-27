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
  ManagedUser,
} from '@/lib/manageUsers';
import UsersTable from './UsersTable';
import UsersPagination from './UsersPagination';

// Same address One Login sends people back to, so it's right in every environment
const SIGN_IN_URL = `${process.env.BETTER_AUTH_URL ?? ''}${process.env.NEXT_PUBLIC_BASE_PATH ?? ''}/login`;

const BANNERS: Record<
  string,
  (user: ManagedUser) => { heading: string; body?: React.ReactNode }
> = {
  added: (user: ManagedUser) => ({
    heading: `${user.name} has been given access`,
    body: (
      <>
        <p className="govuk-body">
          {user.name} can sign in at{' '}
          <a className="govuk-notification-banner__link" href={SIGN_IN_URL}>
            {SIGN_IN_URL.replace(/^https?:\/\//, '')}
          </a>{' '}
          using GOV.UK One Login with the email address {user.email}.
        </p>
        <p className="govuk-body">
          This service does not send sign-in details to new users. These details
          will need to be shared with them directly.
        </p>
      </>
    ),
  }),
  updated: (user: ManagedUser) => ({
    heading: `${user.name}'s details have been updated`,
  }),
  removed: (user: ManagedUser) => ({
    heading: `${user.name}'s access has been removed`,
  }),
  restored: (user: ManagedUser) => ({
    heading: `${user.name}'s access has been restored`,
  }),
};

type Props = {
  searchParams: Promise<{ page?: string; done?: string; user?: string }>;
};

export default async function ManageUsersPage({ searchParams }: Props) {
  const user = await getCurrentUser();
  if (!user) redirect('/login');

  const context = await getApproverContext(user);
  if (!context) notFound();

  const { page, done, user: changedUserId } = await searchParams;
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

  const changedUser = changedUserId
    ? users.find((u) => u.userId === changedUserId)
    : undefined;
  const banner =
    changedUser && done && Object.hasOwn(BANNERS, done)
      ? BANNERS[done](changedUser)
      : null;

  return (
    <Layout
      title="Manage users"
      showLoginInformation={true}
      currentPage="manage-users"
    >
      {banner && (
        <div
          className="govuk-notification-banner govuk-notification-banner--success"
          role="alert"
          aria-labelledby="user-change-title"
          data-module="govuk-notification-banner"
        >
          <div className="govuk-notification-banner__header">
            <h2
              className="govuk-notification-banner__title"
              id="user-change-title"
            >
              Success
            </h2>
          </div>
          <div className="govuk-notification-banner__content">
            <h3 className="govuk-notification-banner__heading">
              {banner.heading}
            </h3>
            {banner.body}
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
