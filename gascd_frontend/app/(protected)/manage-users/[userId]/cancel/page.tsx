import { notFound, redirect } from 'next/navigation';
import Link from 'next/link';
import Layout from '@/components/common/layout/Layout';
import { getCurrentUser } from '@/lib/permissions';
import { getChangeableUser } from '@/lib/manageUsersServer';
import ConfirmChange from '../ConfirmChange';

type Props = { params: Promise<{ userId: string }> };

export default async function CancelInvitePage({ params }: Props) {
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
      title="Cancel invite"
      showLoginInformation={true}
      currentPage="cancel-invite"
    >
      <Link href="/manage-users" className="govuk-back-link">
        Back
      </Link>
      <div className="govuk-grid-row">
        <div className="govuk-grid-column-two-thirds">
          <span className="govuk-caption-l">{user.email}</span>
          <h1 className="govuk-heading-l">
            Are you sure you want to cancel {user.name}&apos;s invite?
          </h1>
          <p className="govuk-body">
            {user.email} will not be able to sign in or see your
            organisation&apos;s data. They will be removed from your list of
            users.
          </p>
          <p className="govuk-body">
            You can invite them again later by adding them as a new user.
          </p>
          <ConfirmChange userId={user.userId} kind="cancel" />
        </div>
      </div>
    </Layout>
  );
}
