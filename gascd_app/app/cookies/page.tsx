'use client';

import React, { useState } from 'react';
import Layout from '@/components/common/layout/Layout';
import Link from 'next/link';
import Cookies from 'js-cookie';

const CookiesPage = () => {
  const [selectedCookiesConsent, setSelectedCookiesConsent] = useState<boolean>(
    Cookies.get('GASCDConsentGDPR') === 'true'
  );

  const handleChange = (value: any) => {
    setSelectedCookiesConsent(value);
  };

  const handleSubmit = () => {
    if (selectedCookiesConsent) {
      Cookies.set('GASCDConsentGDPR', 'true', { expires: 365 });
    } else {
      Cookies.remove('ai_session');
      Cookies.remove('ai_user');
      Cookies.set('GASCDConsentGDPR', 'false', { expires: 365 });
    }
  };

  return (
    <>
      <Layout
        title="Cookies on Get adult social care data"
        showLoginInformation={false}
        currentPage="disclaimer"
        showNavBar={false}
        showCookieBanner={false}
      >
        <div className="govuk-grid-row">
          <div className="govuk-grid-column-two-thirds">
            <h1 className="govuk-heading-xl">
              Cookies on Get adult social care data
            </h1>

            <p className="govuk-body">
              Cookies are small text files that we save on your phone, tablet or
              computer when you use this service. Some cookies on Get adult
              social care data are essential and others are optional.
            </p>
            <p className="govuk-body">We cannot use cookies to identify you.</p>

            <h2 className="govuk-heading-m">Essential cookies</h2>
            <p className="govuk-body">
              Essential cookies are needed to make the service work. If you do
              not want us to use them you can turn off cookies in your web
              browser, but the service may not work properly.
            </p>
            <p className="govuk-body">
              We will not set any essential cookies until you start using the
              service.
            </p>
            <details className="govuk-details">
              <summary className="govuk-details__summary">
                <span className="govuk-details__summary-text">
                  Essential cookies used by this service
                </span>
              </summary>
              <div className="govuk-details__text">
                <h3 className="govuk-heading-s">Essential cookies we use</h3>
                <table className="govuk-table">
                  <thead className="govuk-table__head">
                    <tr className="govuk-table__row">
                      <th scope="row" className="govuk-table__header">
                        Name
                      </th>
                      <th scope="row" className="govuk-table__header">
                        Purpose
                      </th>
                      <th scope="row" className="govuk-table__header">
                        Expires
                      </th>
                    </tr>
                  </thead>
                  <tbody className="govuk-table__body">
                    <tr className="govuk-table__row">
                      <td className="govuk-table__cell">GASCDConsentGDPR</td>
                      <td className="govuk-table__cell">
                        This cookie tracks whether you have accepted or rejected
                        analytical cookies.
                      </td>
                      <td className="govuk-table__cell">1 Year</td>
                    </tr>
                    <tr className="govuk-table__row">
                      <td className="govuk-table__cell">next-auth.*</td>
                      <td className="govuk-table__cell">
                        These cookies are used to keep you logged in to the
                        service.
                      </td>
                      <td className="govuk-table__cell">Session</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </details>

            <h2 className="govuk-heading-m">Optional cookies</h2>
            <p className="govuk-body">
              Optional cookies help us to improve the service, but it will work
              without them. We will not use them without your permission and you
              can change your mind at any time.
            </p>

            <h3 className="govuk-heading-s">
              Analytics cookies (Google Analytics)
            </h3>
            <p className="govuk-body">
              We use Google Analytics software to collect information about how
              you use this service and help us make it better. We do not allow
              Google to use or share this data.
            </p>
            <details className="govuk-details">
              <summary className="govuk-details__summary">
                <span className="govuk-details__summary-text">
                  Analytics cookies used by this service
                </span>
              </summary>
              <div className="govuk-details__text">
                <h3 className="govuk-heading-s">Analytics cookies we use</h3>
                <table className="govuk-table">
                  <thead className="govuk-table__head">
                    <tr className="govuk-table__row">
                      <th scope="row" className="govuk-table__header">
                        Name
                      </th>
                      <th scope="row" className="govuk-table__header">
                        Purpose
                      </th>
                      <th scope="row" className="govuk-table__header">
                        Expires
                      </th>
                    </tr>
                  </thead>
                  <tbody className="govuk-table__body">
                    <tr className="govuk-table__row">
                      <td className="govuk-table__cell">Cookie 1</td>
                      <td className="govuk-table__cell">
                        Plain language description of cookie purpose
                      </td>
                      <td className="govuk-table__cell">Cookie duration</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </details>

            <h3 className="govuk-heading-s">
              Do you want to accept analytics cookies?
            </h3>
            <div className="govuk-form-group">
              <form>
                <fieldset className="govuk-fieldset govuk-!-margin-bottom-6">
                  <div className="govuk-radios" data-module="govuk-radios">
                    <div className="govuk-radios__item">
                      <input
                        className="govuk-radios__input"
                        id="radio-yes"
                        name="options"
                        type="radio"
                        value="yes"
                        onChange={() => handleChange(true)}
                      />
                      <label
                        className="govuk-label govuk-radios__label"
                        htmlFor="radio-yes"
                      >
                        Yes
                      </label>
                    </div>
                    <div className="govuk-radios__item">
                      <input
                        className="govuk-radios__input"
                        id="radio-no"
                        name="options"
                        type="radio"
                        value="no"
                        defaultChecked
                        onChange={() => handleChange(false)}
                      />
                      <label
                        className="govuk-label govuk-radios__label"
                        htmlFor="radio-no"
                      >
                        No
                      </label>
                    </div>
                  </div>
                </fieldset>
                <Link href="" onClick={handleSubmit}>
                  <button type="button" className="govuk-button">
                    Save cookie settings
                  </button>
                </Link>
              </form>
            </div>
          </div>
        </div>
      </Layout>
    </>
  );
};

export default CookiesPage;
