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
  GRANT_BASIS_NI,
  groupDelegatedApprovers,
  groupManagedUsers,
  MANAGE_USERS_PAGE_SIZE,
  ManagedUser,
} from '@/lib/manageUsers';
import UsersTable from './UsersTable';
import Pagination from '@/components/common/pagination/Pagination';
import DelegatedApproversTable from './delegated-approvers/DelegatedApproversTable';
import { SIGN_IN_URL } from '@/lib/signInUrl';
import {
  getApproverLapse,
  getReview,
  getUserReview,
} from '@/lib/accessReviewServer';
import {
  REVIEW_TYPE_APPROVERS,
  REVIEW_TYPE_USERS,
  reviewStatus,
  showLapseNotice,
} from '@/lib/accessReview';

const formatDate = (date: Date) =>
  date.toLocaleDateString('en-GB', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
    timeZone: 'Europe/London',
  });

const EMAIL_MESSAGES: Record<string, (user: ManagedUser) => string> = {
  sent: (user) =>
    `We've sent an email to ${user.email} telling them how to sign in.`,
  failed: () =>
    'We could not send them an email. Share these details with them directly. They can start using GASCD from today.',
};

const BANNERS: Record<
  string,
  (
    user: ManagedUser,
    emailStatus?: string
  ) => { heading: string; body?: React.ReactNode }
> = {
  added: (user: ManagedUser, emailStatus?: string) => ({
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
        <p className="govuk-body" data-testid="invite-email-status">
          {(EMAIL_MESSAGES[emailStatus ?? ''] ?? EMAIL_MESSAGES.failed)(user)}
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
  resent: (user: ManagedUser, emailStatus?: string) => ({
    heading: `${user.name}'s invite has been resent`,
    body: (
      <p className="govuk-body" data-testid="invite-email-status">
        {emailStatus === 'sent'
          ? `We've sent a new email to ${user.email}.${user.inviteExpiresAt ? ` The invite now expires on ${formatDate(user.inviteExpiresAt)}.` : ''}`
          : EMAIL_MESSAGES.failed(user)}
      </p>
    ),
  }),
  cancelled: (user: ManagedUser) => ({
    heading: `The invite to ${user.name} has been cancelled`,
    body: (
      <p className="govuk-body">
        {user.email} will no longer be able to access the service.
      </p>
    ),
  }),
  'approver-removed': (user: ManagedUser, emailStatus?: string) => ({
    heading: `${user.name} is no longer a delegated approver`,
    body: (
      <p className="govuk-body" data-testid="approver-email-status">
        They can still view your organisation&apos;s data, and anyone they gave
        access to keeps it.{' '}
        {emailStatus === 'sent'
          ? `We've sent an email to ${user.email} to let them know.`
          : 'We could not send them an email, so let them know yourself.'}
      </p>
    ),
  }),
  restored: (user: ManagedUser, emailStatus?: string) => ({
    heading: `${user.name}'s access has been restored`,
    body:
      emailStatus && EMAIL_MESSAGES[emailStatus] ? (
        <p className="govuk-body" data-testid="invite-email-status">
          {EMAIL_MESSAGES[emailStatus](user)}
        </p>
      ) : undefined,
  }),
};

const breadcrumbs = [
  { text: 'Home', url: '/home' },
  { text: 'Manage users', url: '/manage-users' },
];

type Props = {
  searchParams: Promise<{
    page?: string;
    done?: string;
    user?: string;
    email?: string;
  }>;
};

export default async function ManageUsersPage({ searchParams }: Props) {
  const user = await getCurrentUser();
  if (!user) redirect('/login');

  const context = await getApproverContext(user);
  if (!context) notFound();

  const {
    page,
    done,
    user: changedUserId,
    email: emailStatus,
  } = await searchParams;
  const grants = await listProviderGrants(context.providerCode);
  const users = groupManagedUsers(grants, context, user.id);
  const canAppoint = context.basis === GRANT_BASIS_NI;
  const approvers = canAppoint ? groupDelegatedApprovers(grants, user.id) : [];
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

  const changedUser = !changedUserId
    ? undefined
    : (users.find((u) => u.userId === changedUserId) ??
      groupManagedUsers(
        await listProviderGrants(context.providerCode, changedUserId),
        context,
        user.id,
        new Date(),
        true
      )[0]);
  const banner =
    changedUser && done && Object.hasOwn(BANNERS, done)
      ? BANNERS[done](changedUser, emailStatus)
      : null;

  const usersReview = reviewStatus(
    REVIEW_TYPE_USERS,
    await getUserReview(context)
  );
  const approversReview =
    canAppoint && approvers.length > 0
      ? reviewStatus(
          REVIEW_TYPE_APPROVERS,
          await getReview(context.providerCode, REVIEW_TYPE_APPROVERS)
        )
      : null;
  const lapse = canAppoint
    ? await getApproverLapse(context.providerCode)
    : null;
  const reviewsDue = [
    lapse &&
      showLapseNotice(lapse.lapsedAt, lapse.appointedAt) && {
        id: 'approvers-lapsed',
        heading: 'Your delegated approvers no longer have the approver role',
        body: 'The deadline for confirming your delegated approvers has passed, so they can no longer give or remove access. They can still see the data for your organisation, and you can appoint them again in the Delegated approvers section below.',
        href: '/manage-users/delegated-approvers/appoint',
        link: 'Appoint a delegated approver',
      },
    approversReview?.due &&
      approversReview.deadline &&
      (approversReview.overdue
        ? {
            id: 'approvers',
            heading:
              'The deadline to review your delegated approvers has passed',
            body: 'Review them today to keep their role. Otherwise they will no longer be able to give or remove access.',
            href: '/manage-users/delegated-approvers/review',
            link: 'Review your delegated approvers',
          }
        : {
            id: 'approvers',
            heading: `Review your delegated approvers by ${formatDate(approversReview.deadline)}`,
            body: 'If nobody who is a Nominated Individual for your organisation reviews them by then, they will no longer be able to give or remove access.',
            href: '/manage-users/delegated-approvers/review',
            link: 'Review your delegated approvers',
          }),
    usersReview?.due && {
      id: 'users',
      heading: 'It’s time for your yearly check of who has access',
      body: 'Make sure everyone on your list still needs access, then confirm it is up to date.',
      href: '/manage-users/review',
      link: 'Review who has access',
    },
  ].filter(Boolean) as {
    id: string;
    heading: string;
    body: string;
    href: string;
    link: string;
  }[];

  return (
    <Layout
      title="Manage users"
      showLoginInformation={true}
      currentPage="manage-users"
      breadcrumbs={breadcrumbs}
    >
      {banner && (
        <div className="govuk-grid-row">
          <div className="govuk-grid-column-two-thirds">
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
          </div>
        </div>
      )}

      {!banner &&
        reviewsDue.map((review) => (
          <div className="govuk-grid-row" key={review.id}>
            <div className="govuk-grid-column-two-thirds">
              <div
                className="govuk-notification-banner"
                role="region"
                aria-labelledby={`review-${review.id}-title`}
                data-module="govuk-notification-banner"
                data-testid={`review-due-${review.id}`}
              >
                <div className="govuk-notification-banner__header">
                  <h2
                    className="govuk-notification-banner__title"
                    id={`review-${review.id}-title`}
                  >
                    Important
                  </h2>
                </div>
                <div className="govuk-notification-banner__content">
                  <p className="govuk-notification-banner__heading">
                    {review.heading}
                  </p>
                  <p className="govuk-body">{review.body}</p>
                  <Link
                    className="govuk-notification-banner__link"
                    href={review.href}
                  >
                    {review.link}
                  </Link>
                </div>
              </div>
            </div>
          </div>
        ))}

      <span className="govuk-caption-l">{context.providerName}</span>
      <h1 className="govuk-heading-l">Manage users</h1>
      <div className="govuk-grid-row">
        <div className="govuk-grid-column-two-thirds">
          <p className="govuk-body">
            Choose which users in your organisation can access GASCD. You are
            responsible for keeping this list up to date.
          </p>
          <p className="govuk-body">
            Remove anyone who no longer needs access, for example when they
            leave your organisation or change roles. Once a year we will also
            ask you to check who has access and confirm the list is up to date.
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
        <Pagination
          currentPage={currentPage}
          totalPages={totalPages}
          pageHref={(page) => `/manage-users?page=${page}`}
        />
      )}

      {canAppoint && (
        <section aria-labelledby="delegated-approvers-heading">
          <h2 className="govuk-heading-m" id="delegated-approvers-heading">
            Delegated approvers
          </h2>
          <div className="govuk-grid-row">
            <div className="govuk-grid-column-two-thirds">
              <p className="govuk-body">
                A delegated approver can give and remove access to any location
                in your organisation, like you. Only a Nominated Individual can
                appoint or remove them.
              </p>
            </div>
          </div>
          <Link
            href="/manage-users/delegated-approvers/appoint"
            className="govuk-button govuk-button--secondary"
          >
            Appoint a delegated approver
          </Link>
          <DelegatedApproversTable approvers={approvers} />
        </section>
      )}
    </Layout>
  );
}
