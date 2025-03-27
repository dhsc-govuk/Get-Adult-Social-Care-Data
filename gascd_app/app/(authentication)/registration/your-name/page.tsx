'use client';

import React, { useEffect, useState } from 'react';
import Layout from '@/components/common/layout/Layout';
import StandardButton from '@/components/common/buttons/functionality/standard-button/StandardButton';
import LabelledInput from '@/components/common/input/LabelledInput';

const RegisterYourNamePage: React.FC = () => {
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');

  useEffect(() => {
    if (!window?.localStorage) return;

    const storedFirstName = localStorage.getItem('firstName');
    const storedLastName = localStorage.getItem('lastName');

    storedFirstName && setFirstName(storedFirstName);
    storedLastName && setLastName(storedLastName);
  }, []);

  const handleSubmit = () => {
    localStorage.setItem('firstName', firstName);
    localStorage.setItem('lastName', lastName);
  };

  return (
    <>
      <title>What is your name - Get adult social care data - GOV.UK</title>
      <Layout showLoginInformation={false} currentPage={'register-your-name'}>
        <a href="/register/confirm-code" className="govuk-back-link">
          Back
        </a>
        <div className="govuk-grid-row">
          <div className="govuk-grid-column-two-thirds">
            <h1 className="govuk-heading-l">What is your name?</h1>

            <form
              className="form"
              action="job-title"
              method="post"
              onSubmit={handleSubmit}
            >
              <div className="govuk-form-group">
                <LabelledInput
                  inputId="register-first-name"
                  eventName="firstName"
                  value={firstName}
                  onChange={(e) => setFirstName(e.target.value)}
                  ariaLabel="Enter first name"
                >
                  First Name
                </LabelledInput>
              </div>

              <div className="govuk-form-group">
                <LabelledInput
                  inputId="register-last-name"
                  eventName="lastName"
                  value={lastName}
                  onChange={(e) => setLastName(e.target.value)}
                  ariaLabel="Enter last name"
                >
                  Last Name
                </LabelledInput>
              </div>

              <button className="govuk-button" type="submit">
                Continue
              </button>
            </form>
          </div>
        </div>
      </Layout>
    </>
  );
};

export default RegisterYourNamePage;
