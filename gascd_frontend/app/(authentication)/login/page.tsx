'use client';

import React, { useActionState } from 'react';
import Layout from '../../../src/components/common/layout/Layout';
import { authClient } from '@/lib/auth-client';

const LoginPage: React.FC = () => {
  const handleSubmit = async () => {
    const { data, error } = await authClient.signIn.oauth2({
      providerId: 'govuk-one-login',
      callbackURL: '/home',
    });
    if (error) {
      return {
        error:
          'Sorry, there is a problem with the service. Please try again later.',
      };
    }
  };

  const [state, formAction, isPending] = useActionState(handleSubmit, null);

  return (
    <>
      <Layout
        title="Login"
        showLoginInformation={false}
        currentPage="login"
        showNavBar={false}
      >
        <div className="govuk-grid-row">
          <div className="govuk-grid-column-two-thirds">
            <h1 className="govuk-heading-xl">
              Get adult social care data service
            </h1>
            <p className="govuk-body">
              Use this service to view, explore and download adult social care
              data:
            </p>
            <ul className="govuk-list govuk-list--bullet">
              <li>
                check data on registered care homes and home care providers
              </li>
              <li>view statistics on unpaid carers</li>
              <li>explore local authority funding data</li>
              <li>
                see population needs by population size, age, health indicators,
                disability and economic factors
              </li>
            </ul>
            <p className="govuk-body">
              This data helps adult social care providers and local authorities
              understand local demand, track trends and support planning and
              commissioning
            </p>

            <h2 className="govuk-heading-m">Who can use this service</h2>
            <p className="govuk-body">
              You can only use this service if you are the nominated individual
              for a CQC registered care provider organisation or are a local
              authority officer.
            </p>

            <div className="govuk-inset-text">
              <h2 className="govuk-heading-m">Important</h2>
              <p className="govuk-body">
                Note this service provides information only and does not
                constitute advice. DHSC does not accept any liability for
                decisions made by providers following use of this service. For
                further details read our{' '}
                <a
                  className="govuk-link"
                  href="/terms-of-use"
                  target="_blank"
                  rel="noreferrer noopener"
                >
                  Terms of use (opens in a new tab)
                </a>
                .
              </p>
            </div>

            <h2 className="govuk-heading-m">Before you start</h2>
            <p className="govuk-body">
              You need a{' '}
              <a
                className="govuk-link"
                href="https://www.gov.uk/using-your-gov-uk-one-login"
              >
                GOV.UK One Login
              </a>{' '}
              to sign in to this service, and it must be tied to your CQC
              registered email address or your gov.uk email address if you are a
              local authority officer. You can{' '}
              <a
                className="govuk-link"
                href="https://signin.account.gov.uk/sign-in-or-create"
              >
                create one
              </a>{' '}
              if you do not already have one.
            </p>
            <p className="govuk-body">
              You can have more than one GOV.UK One login, for example, a work
              account in addition to your personal account, so you can create
              one to access this service.
            </p>
            <p className="govuk-body">
              Find out why you need a{' '}
              <a className="govuk-link" href="/terms-of-use">
                GOV.UK One Login
              </a>
            </p>
            <form action={formAction}>
              <button
                type="submit"
                className="govuk-button govuk-button--start"
                data-module="govuk-button"
                disabled={isPending}
              >
                {isPending ? 'Signing in...' : 'Start now'}
                {!isPending && (
                  <svg
                    className="govuk-button__start-icon"
                    xmlns="http://www.w3.org/2000/svg"
                    width="17.5"
                    height="19"
                    viewBox="0 0 33 40"
                    aria-hidden="true"
                    focusable="false"
                  >
                    <path
                      fill="currentColor"
                      d="M0 0h13l20 20-20 20H0l20-20z"
                    />
                  </svg>
                )}
              </button>
              {state && <p className="govuk-error-message">{state.error}</p>}
            </form>
            <h2 className="govuk-heading-m">About using this service</h2>
            <p className="govuk-body">
              By using this service, you are agreeing to our{' '}
              <a className="govuk-link" href="/terms-of-use">
                terms of use
              </a>{' '}
              and{' '}
              <a className="govuk-link" href="/privacy-policy">
                privacy policy
              </a>
              .
            </p>
            <h2 className="govuk-heading-m">More information</h2>
            <p className="govuk-body">
              Find out more about the{' '}
              <a className="govuk-link" href="/guidance">
                Get adult social care data service
              </a>
              .
            </p>
            <p className="govuk-body">
              For enquiries about the service, please contact the GASCD team at{' '}
              <a
                href="mailto:getadultsocialcaredata.team@dhsc.gov.uk"
                className="govuk-link govuk-link--no-underline"
              >
                getadultsocialcaredata.team@dhsc.gov.uk
              </a>
              .
            </p>
          </div>
        </div>
      </Layout>
    </>
  );
};

export default LoginPage;
