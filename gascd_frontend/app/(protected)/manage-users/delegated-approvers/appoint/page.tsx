import { notFound, redirect } from 'next/navigation';
import Layout from '@/components/common/layout/Layout';
import { getCurrentUser } from '@/lib/permissions';
import { getApproverContext } from '@/lib/manageUsersServer';
import { GRANT_BASIS_NI } from '@/lib/manageUsers';
import AppointApproverForm from './AppointApproverForm';

export default async function AppointApproverPage() {
  const user = await getCurrentUser();
  if (!user) redirect('/login');

  const context = await getApproverContext(user);
  if (!context || context.basis !== GRANT_BASIS_NI) notFound();

  return (
    <Layout
      title="Appoint a delegated approver"
      showLoginInformation={true}
      currentPage="appoint-approver"
    >
      <div className="govuk-grid-row">
        <div className="govuk-grid-column-two-thirds">
          <AppointApproverForm />
        </div>
      </div>
    </Layout>
  );
}
