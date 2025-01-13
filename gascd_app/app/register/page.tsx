'use client';

import React from 'react';
import Layout from '../../src/components/common/layout/Layout';
import ButtonWithArrow from '../../src/components/common/buttons/navigation/button-with-arrow/ButtonWithArrow';
import './registerPage.scss';

const RegisterPage: React.FC = () => {
  return (
    <Layout showLoginInformation={false}>
      <section aria-labelledby="main-content-heading" role="region">
        <div className="govuk-grid-row">
          <div className="govuk-grid-column-two-thirds">
            <h1 id="main-content-heading" className="govuk-heading-l">
              Adult social care data access portal
            </h1>
            <p className="govuk-body">Use this service to:</p>
            <ul className="govuk-list govuk-list--bullet">
              <li>view Adult Social Care summary data</li>
              <li>view Quality of Care metrics</li>
              <li>view capacity within and between areas</li>
            </ul>
            <p className="govuk-body govuk-!-margin-bottom-5">
              Registering takes around 2 minutes
            </p>
            <ButtonWithArrow buttonString="Start" buttonUrl="/home" />
            <h2 className="govuk-heading-m">Before you start</h2>
            <p className="govuk-body">
              You can also{' '}
              <a className="govuk-link" href="#">
                register
              </a>{' '}
              if...
            </p>
            <p className="govuk-body">
              The online service is also available in{' '}
              <a className="govuk-link" href="#">
                Welsh (Cymraeg)
              </a>{' '}
            </p>
            <p className="govuk-body">
              You cannot register for this service if ..
            </p>
          </div>
          <div className="govuk-grid-column-one-third">
            <h2 className="govuk-heading-m quick-links-header govuk-!-padding-top-2">
              Quick Links
            </h2>
            <ul className="govuk-list">
              <li className="govuk-!-margin-bottom-2">
                <a className="govuk-link" href="/login">
                  Login
                </a>
              </li>
              <li className="govuk-!-margin-bottom-2">
                <a className="govuk-link" href="#">
                  About Us
                </a>
              </li>
              <li>
                <a className="govuk-link" href="#">
                  More
                </a>
              </li>
            </ul>
          </div>
        </div>
      </section>
    </Layout>
  );
};

export default RegisterPage;
