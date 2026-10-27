import { notFound, redirect } from 'next/navigation';
import Link from 'next/link';
import Layout from '@/components/common/layout/Layout';
import { getCurrentUser } from '@/lib/permissions';
import { getChangeableUser } from '@/lib/manageUsersServer';
import ConfirmChange from '../ConfirmChange';

type Props = { params: Promise<{ userId: string }> };

export default async function RemoveUserPage({ params }: Props) {
  const actor = await getCurrentUser();
  if (!actor) redirect('/login');

  const { userId } = await params;
  const changeable = await getChangeableUser(actor, userId);
  if (!changeable || changeable.user.status === 'Removed') notFound();
  const { context, user } = changeable;

  return (
    <Layout
      title="Remove access"
      showLoginInformation={true}
      currentPage="remove-user"
    >
      <Link href="/manage-users" className="govuk-back-link">
        Back
      </Link>
      <div className="govuk-grid-row">
        <div className="govuk-grid-column-two-thirds">
          <span className="govuk-caption-l">{user.email}</span>
          <h1 className="govuk-heading-l">
            Are you sure you want to remove {user.name}&apos;s access?
          </h1>
          <p className="govuk-body">
            They will no longer be able to see{' '}
            {context.providerWide
              ? `data for ${context.providerName}`
              : 'data for the locations you manage'}
            . You can restore their access later.
          </p>
          <ConfirmChange userId={user.userId} kind="remove" />
        </div>
      </div>
    </Layout>
  );
}
