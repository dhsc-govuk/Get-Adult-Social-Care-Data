'use client';

import React, { useCallback, useState } from 'react';
import Layout from '../../../src/components/common/layout/Layout';
import ButtonWithArrow from '../../../src/components/common/buttons/navigation/button-with-arrow/ButtonWithArrow';
import Link from 'next/link';
import { signIn } from 'next-auth/react';

const LoginPage: React.FC = () => {
  const [email, setEmail] = useState<string>('');

  const handleSubmit = () => {
    signIn('azure-ad-b2c-signin', { callbackUrl: '/home' });
  };

  return (
    <>
      <Layout
        showLoginInformation={false}
        currentPage="login"
        showNavBar={false}
      >
        <div className="govuk-grid-row">
          <div className="govuk-grid-column-two-thirds">
            <h1 className="govuk-heading-l">
              Get adult social care data              
            </h1>
            <p className="govuk-body-l">
              The best place for care providers to find useful information
              relevant to Adult Social Care in England.
            </p>
            <h2 className="govuk-heading-m">
              Introduction
            </h2>
            <p className="govuk-body">
              This new digital service is owned by DHSC and is being developed by the data access project. The aim is to support adult social care stakeholders to make better evidence-based decisions which will help them to improve outcomes for people who need adult social care services. The project does not collect any additional information but aims to reflect back data that is already being collected at national level, with people who need it. Data shared through the tool complies with current Data Sharing Agreements.              
            </p>
            <p className="govuk-body">
              The content here has been developed and designed with ongoing support from a range of care providers, to understand what data insight is most useful to them. Over time, the content will expand to new topics and new user groups.
            </p>
            <p className="govuk-body">
              This version of the service is being shared with a limited number of care home providers for testing purposes only (private beta).              
            </p>
            <p className="govuk-inset-text">
              Please note that this service provides information only and does not constitute advice. DHSC does not accept any liability for decisions made by providers following use of this service. Content is not to be published or shared with third parties.
            </p>
            <ButtonWithArrow
              buttonString="Sign in"
              buttonUrl="#"
              onClick={handleSubmit}
            ></ButtonWithArrow>
          </div>
        </div>
      </Layout>
    </>
  );
};

export default LoginPage;
