import { notFound, redirect } from 'next/navigation';
import Layout from '@/components/common/layout/Layout';
import { getCurrentUser } from '@/lib/permissions';
import { getChangeableUser } from '@/lib/manageUsersServer';
import { currentLocationSelection } from '@/lib/manageUsers';
import EditUserForm from './EditUserForm';

type Props = { params: Promise<{ userId: string }> };

export default async function EditUserPage({ params }: Props) {
  const actor = await getCurrentUser();
  if (!actor) redirect('/login');

  const { userId } = await params;
  const changeable = await getChangeableUser(actor, userId);
  if (!changeable || changeable.user.status === 'Removed') notFound();
  const { context, grants, user } = changeable;

  return (
    <Layout
      title="Edit user"
      showLoginInformation={true}
      currentPage="edit-user"
    >
      <div className="govuk-grid-row">
        <div className="govuk-grid-column-two-thirds">
          <EditUserForm
            userId={user.userId}
            email={user.email}
            initialName={user.name}
            initialLocations={currentLocationSelection(grants, context)}
            providerWide={context.providerWide}
            locations={context.locations}
          />
        </div>
      </div>
    </Layout>
  );
}
