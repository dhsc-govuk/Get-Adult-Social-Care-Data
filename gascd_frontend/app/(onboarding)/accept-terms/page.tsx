'use client';

import React, { useEffect, useState } from 'react';
import Layout from '../../../src/components/common/layout/Layout';
import { useRouter } from 'next/navigation';
import { authClient } from '@/lib/auth-client';

const ConsentPage: React.FC = () => {
  const router = useRouter();

  const handleSubmit = async () => {
    await authClient.updateUser({
      termsAccepted: true,
      termsAcceptedDate: new Date(),
    });
    router.push('/home#top');
  };

  return (
    <Layout
      title="You must agree to our Terms of use"
      showLoginInformation={false}
      currentPage="accept-terms"
    >
      <div className="govuk-grid-row">
        <div className="govuk-grid-column-two-thirds">
          <h1 className="govuk-heading-xl">Terms of use</h1>

          <p className="govuk-body">
            You must agree to agree to our{' '}
            <a
              className="govuk-link"
              href="/terms-of-use"
              target="_blank"
              rel="noopener noreferrer"
            >
              Terms of use (opens in new window)
            </a>{' '}
            to use this service.
          </p>

          <button
            type="button"
            className="govuk-button"
            onClick={() => handleSubmit()}
          >
            Agree
          </button>
        </div>
      </div>
    </Layout>
  );
};

export default ConsentPage;
