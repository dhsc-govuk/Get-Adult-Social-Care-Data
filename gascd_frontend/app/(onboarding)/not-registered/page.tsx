'use client';
import React from 'react';
import Layout from '@/components/common/layout/Layout';
import { useSession } from '@/lib/auth-client';

const NotRegisteredPage: React.FC = () => {
  const { data: session } = useSession();
  return (
    <>
      <Layout title="Not Registered" currentPage="not-registered">
        <div className="govuk-grid-row">
          <div className="govuk-grid-column-two-thirds">
            <h1 className="govuk-heading-l">Not Registered</h1>
            <p className="govuk-body">
              Get adult social care data is in a beta testing phase.
            </p>
            <p className="govuk-body">
              The email address you have logged in with does not match a
              registered beta user: <b>{session?.user.email}</b>
            </p>
          </div>
        </div>
      </Layout>
    </>
  );
};

export default NotRegisteredPage;
