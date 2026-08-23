import React from 'react';
import Link from 'next/link';
import Form from 'next/form';
import Layout from '@/components/common/layout/Layout';
import LookupLA from './LookupLA';
import { redirect } from 'next/navigation';
import { checkEmailDomain } from './actions';
import { isBadQueryStringValue } from '@/lib/domain-check';

type Props = {
  searchParams: Promise<{ id?: string }>;
};
const EmailLookupPage: React.FC<Props> = async ({ searchParams }) => {
  const { id } = await searchParams;

  if (isBadQueryStringValue(id)) {
    redirect('/login');
  }

  console.log('=======+>>>', id);

  return (
    <Layout
      title="Check your email here"
      showLoginInformation={false}
      currentPage="lookup-email"
      showNavBar={false}
    >
      <div className="govuk-grid-row">
        <div className="govuk-grid-column-two-thirds">
          <div className="govuk-form-group">
            <Form action={checkEmailDomain}>
              <LookupLA />

              {/* Form Trigger(s) */}
              <div className="govuk-button-group govuk-!-margin-top-6">
                <button
                  type="submit"
                  className="govuk-button"
                  data-module="govuk-button"
                >
                  Continue
                </button>
                {/* <button
                type="submit"
                className="govuk-button govuk-button--start"
                data-module="govuk-button"
                disabled={isPending}
              >
                {isPending ? 'Signing in...' : 'Continue'}
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
              {state && <p className="govuk-error-message">{state.error}</p>} */}

                <Link href="#" className="govuk-link">
                  Cancel and go back
                </Link>
              </div>
            </Form>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default EmailLookupPage;
