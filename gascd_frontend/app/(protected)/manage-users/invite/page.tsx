import { notFound, redirect } from 'next/navigation';
import Layout from '@/components/common/layout/Layout';
import { getCurrentUser } from '@/lib/permissions';
import { getApproverContext } from '@/lib/manageUsersServer';
import InviteUserForm from './InviteUserForm';

export default async function InviteUserPage() {
  const user = await getCurrentUser();
  if (!user) redirect('/login');

  const context = await getApproverContext(user);
  if (!context) notFound();

  return (
    <Layout
      title="Invite a new user"
      showLoginInformation={true}
      currentPage="invite-user"
    >
      <div className="govuk-grid-row">
        <div className="govuk-grid-column-two-thirds">
          <InviteUserForm
            providerWide={context.providerWide}
            locations={context.locations}
          />
        </div>
      </div>
    </Layout>
  );
}
