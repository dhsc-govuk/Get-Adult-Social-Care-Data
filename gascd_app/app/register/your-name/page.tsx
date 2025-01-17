'use client';

import React, { useEffect, useState } from 'react';
import Layout from '@/components/common/layout/Layout';
import StandardButton from '@/components/common/buttons/functionality/standard-button/StandardButton';

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
              <h1 className="govuk-label-wrapper">
                <label className="govuk-label" htmlFor="register-first-name">
                  First Name
                </label>
              </h1>
              <input
                className="govuk-input govuk-input--width-20"
                id="register-first-name"
                name="firstName"
                type="text"
                value={firstName}
                onChange={(e) => setFirstName(e.target.value)}
              />
            </div>

            <div className="govuk-form-group">
              <h1 className="govuk-label-wrapper">
                <label className="govuk-label" htmlFor="register-last-name">
                  Last Name
                </label>
              </h1>
              <input
                className="govuk-input govuk-input--width-20"
                id="register-last-name"
                name="lastName"
                type="text"
                value={lastName}
                onChange={(e) => setLastName(e.target.value)}
              />
            </div>

            <button className="govuk-button" type="submit">
              Continue
            </button>
          </form>
        </div>
      </div>
    </Layout>
  );
};

export default RegisterYourNamePage;
