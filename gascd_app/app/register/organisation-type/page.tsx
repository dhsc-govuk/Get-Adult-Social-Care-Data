'use client';

import React from 'react';
import Layout from '@/components/common/layout/Layout';
import StandardButton from '@/components/common/buttons/functionality/standard-button/StandardButton';

const RegisterJobTitlePage: React.FC = () => {
  return (
    <Layout
      showLoginInformation={false}
      currentPage={'register-organisation-type'}
    >
      <a href="/register/job-title" className="govuk-back-link">
        Back
      </a>
      <div className="govuk-grid-row">
        <div className="govuk-grid-column-two-thirds">
          <form className="form" action="organisation-name" method="post">
            <div className="govuk-form-group">
              <fieldset className="govuk-fieldset">
                <legend className="govuk-fieldset__legend govuk-fieldset__legend--l">
                  <h1 className="govuk-fieldset__heading">
                    What is your organisation type?
                  </h1>
                </legend>
                <div className="govuk-radios" data-module="govuk-radios">
                  <div className="govuk-radios__item">
                    <input
                      className="govuk-radios__input"
                      id="whatOrganisationType"
                      name="whatOrganisationType"
                      type="radio"
                      value="academicInstitution"
                    />
                    <label
                      className="govuk-label govuk-radios__label"
                      htmlFor="whatOrganisationType"
                    >
                      Academic institution
                    </label>
                  </div>
                  <div className="govuk-radios__item">
                    <input
                      className="govuk-radios__input"
                      id="whatOrganisationType-2"
                      name="whatOrganisationType"
                      type="radio"
                      value="careProvider"
                    />
                    <label
                      className="govuk-label govuk-radios__label"
                      htmlFor="whatOrganisationType-2"
                    >
                      Care provider
                    </label>
                  </div>
                  <div className="govuk-radios__item">
                    <input
                      className="govuk-radios__input"
                      id="whatOrganisationType-3"
                      name="whatOrganisationType"
                      type="radio"
                      value="publicBody"
                    />
                    <label
                      className="govuk-label govuk-radios__label"
                      htmlFor="whatOrganisationType-3"
                    >
                      Government department or other public body
                    </label>
                  </div>
                  <div className="govuk-radios__item">
                    <input
                      className="govuk-radios__input"
                      id="whatOrganisationType-4"
                      name="whatOrganisationType"
                      type="radio"
                      value="localAuthority"
                    />
                    <label
                      className="govuk-label govuk-radios__label"
                      htmlFor="whatOrganisationType-4"
                    >
                      Local authority
                    </label>
                  </div>
                  <div className="govuk-radios__item">
                    <input
                      className="govuk-radios__input"
                      id="whatOrganisationType-4"
                      name="whatOrganisationType"
                      type="radio"
                      value="membershipOrganisation"
                    />
                    <label
                      className="govuk-label govuk-radios__label"
                      htmlFor="whatOrganisationType-4"
                    >
                      Membership organisation
                    </label>
                  </div>
                  <div className="govuk-radios__item">
                    <input
                      className="govuk-radios__input"
                      id="whatOrganisationType-4"
                      name="whatOrganisationType"
                      type="radio"
                      value="nhs"
                    />
                    <label
                      className="govuk-label govuk-radios__label"
                      htmlFor="whatOrganisationType-4"
                    >
                      NHS
                    </label>
                  </div>
                  <div className="govuk-radios__item">
                    <input
                      className="govuk-radios__input"
                      id="whatOrganisationType-4"
                      name="whatOrganisationType"
                      type="radio"
                      value="other"
                    />
                    <label
                      className="govuk-label govuk-radios__label"
                      htmlFor="whatOrganisationType-4"
                    >
                      Other
                    </label>
                  </div>
                </div>
              </fieldset>
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

export default RegisterJobTitlePage;
