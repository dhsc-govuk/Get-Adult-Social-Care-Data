'use client';

import React, { useEffect, useState } from 'react';
import Layout from '../../../src/components/common/layout/Layout';
import { useRouter } from 'next/navigation';
import { authClient } from '@/lib/auth-client';
import TermsOfUse from '@/components/terms-of-use/TermsOfUse';

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
      title="Agree to our terms of use"
      showLoginInformation={false}
      currentPage="accept-terms"
    >
      <p className="govuk-body">
        You need to agree to the ToS before using this service.
      </p>

      <button
        type="button"
        className="govuk-button"
        onClick={() => handleSubmit()}
      >
        Accept terms and continue
      </button>
    </Layout>
  );
};

export default ConsentPage;
