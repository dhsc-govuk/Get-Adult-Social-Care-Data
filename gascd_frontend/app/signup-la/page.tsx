import React from 'react';
import Layout from '@/components/common/layout/Layout';
import Form from 'next/form';

const OPTIONS_LA: Record<'text' | 'value', string>[] = [
  { value: 'eastmidlands', text: 'East Midlands' },
  { value: 'eastofengland', text: 'East of England' },
  { value: 'london', text: 'London' },
  { value: 'northeast', text: 'North East' },
  { value: 'northwest', text: 'North West' },
  { value: 'southeast', text: 'South East' },
  { value: 'southwest', text: 'South West' },
  { value: 'westmidlands', text: 'West Midlands' },
  { value: 'yorkshire', text: 'Yorkshire and the Humber' },
];

const SignupLAPage: React.FC = () => {
  return (
    <Layout
      title="Signup LA"
      currentPage="signup-la"
      showLoginInformation={false}
    >
      <div className="govuk-grid-row">
        <div className="govuk-grid-column-two-thirds">
          <h1 className="govuk-heading-xl">
            We could not verify your email address
          </h1>
          <p className="govuk-heading-s">
            We could not verify that the email address you entered belongs to a
            Local Authority.
          </p>
          <p className="govuk-body">
            If you entered the wrong email address,{' '}
            <a className="govuk-link" href="#">
              go back
            </a>{' '}
            and try again using your Local Authority email address.
          </p>

          <h2 className="govuk-heading-l">If you think there is a problem</h2>
          <p className="govuk-body">
            If you believe you should have access to this service, complete the
            access request form.
          </p>

          <Form
            action={async function handler(formdata: FormData) {
              'use server';
              console.log('Logging...', formdata);
            }}
          >
            <div className="govuk-form-group">
              <label className="govuk-label" htmlFor="regfullname">
                Full name
              </label>

              <input
                className="govuk-input govuk-!-width-one-half"
                id="regfullname"
                name="regfullname"
                type="text"
                spellCheck="false"
                autoComplete="regfullname"
              />
            </div>

            <div className="govuk-form-group">
              <label className="govuk-label" htmlFor="regla">
                Local Authority
              </label>
              <div id="regla-hint" className="govuk-hint">
                If your Local Authority is not listed, select Other and enter
                the name of your organisation
              </div>
              <select
                className="govuk-select govuk-!-width-one-half"
                id="regla"
                name="regla"
                aria-describedby="regla-hint"
              >
                <option value="" selected>
                  Select your Local Authority from the list
                </option>

                {OPTIONS_LA.map((opt) => (
                  <option key={opt.value} value={opt.value}>
                    {opt.text}
                  </option>
                ))}
              </select>
            </div>

            <div className="govuk-form-group">
              <label className="govuk-label" htmlFor="regorgname">
                Name of your organisation (optional)
              </label>

              <input
                className="govuk-input govuk-!-width-one-half"
                id="regorgname"
                name="regorgname"
                type="text"
                spellCheck="false"
                autoComplete="regorgname"
              />
            </div>

            <div className="govuk-form-group">
              <label className="govuk-label" htmlFor="regrole">
                Your role in the organisation
              </label>

              <input
                className="govuk-input govuk-!-width-one-half"
                id="regrole"
                name="regrole"
                type="text"
                spellCheck="false"
                autoComplete="regrole"
              />
            </div>

            <div className="govuk-form-group">
              <label className="govuk-label" htmlFor="regmail">
                Local Authority email address
              </label>

              <input
                className="govuk-input govuk-!-width-one-half"
                id="regmail"
                name="regmail"
                type="email"
                spellCheck="false"
                autoComplete="regmail"
              />
            </div>
            {/* ------------------------------------- */}
            <button
              type="submit"
              className="govuk-button"
              data-module="govuk-button"
            >
              Request access to GASCD
            </button>
          </Form>
        </div>
      </div>
    </Layout>
  );
};

export default SignupLAPage;
