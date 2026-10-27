import { notFound, redirect } from 'next/navigation';
import Link from 'next/link';
import Layout from '@/components/common/layout/Layout';
import { getCurrentUser } from '@/lib/permissions';
import { getChangeableUser } from '@/lib/manageUsersServer';
import ConfirmChange from '../ConfirmChange';

type Props = { params: Promise<{ userId: string }> };

export default async function RestoreUserPage({ params }: Props) {
  const actor = await getCurrentUser();
  if (!actor) redirect('/login');

  const { userId } = await params;
  const changeable = await getChangeableUser(actor, userId);
  if (!changeable || changeable.user.status !== 'Removed') notFound();
  const { user } = changeable;

  return (
    <Layout
      title="Restore access"
      showLoginInformation={true}
      currentPage="restore-user"
    >
      <Link href="/manage-users" className="govuk-back-link">
        Back
      </Link>
      <div className="govuk-grid-row">
        <div className="govuk-grid-column-two-thirds">
          <span className="govuk-caption-l">{user.email}</span>
          <h1 className="govuk-heading-l">
            Restore {user.name}&apos;s access?
          </h1>
          <p className="govuk-body">
            They will be able to see data for the same locations as before:{' '}
            {user.allLocations
              ? 'all locations'
              : user.locationNames.join(', ')}
            .
          </p>
          <ConfirmChange userId={user.userId} kind="restore" />
        </div>
      </div>
    </Layout>
  );
}
