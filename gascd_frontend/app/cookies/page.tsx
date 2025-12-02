'use client';

import React, { useState, useEffect } from 'react';
import Layout from '@/components/common/layout/Layout';
import Link from 'next/link';
import Cookies from 'js-cookie';
import { COOKIE_CONSENT_NAME } from '@/constants';
import CookiesService from '@/services/cookies/CookiesService';

const CookiesPage = () => {
  const [selectedCookiesConsent, setSelectedCookiesConsent] =
    useState<boolean>(false);

  const [cookiesSaved, setCookiesSaved] = useState<boolean>(false);

  useEffect(() => {
    if (Cookies.get(COOKIE_CONSENT_NAME) === 'true') {
      setSelectedCookiesConsent(true);
    } else {
      setSelectedCookiesConsent(false);
    }
  }, []);

  const handleChange = (value: any) => {
    setSelectedCookiesConsent(value);
  };

  const handleSubmit = () => {
    setCookiesSaved(true);
    window.scrollTo({ top: 0 });

    if (selectedCookiesConsent) {
      CookiesService.setConsentCookieTrue();
    } else {
      CookiesService.setConsentCookieFalse();
    }
  };

  return (
    <>
      <Layout
        title="Cookies on Get adult social care data"
        showLoginInformation={false}
        currentPage="disclaimer"
        showNavBar={false}
        useCookieBanner={false}
      >
        <div className="govuk-grid-row">
          <div className="govuk-grid-column-two-thirds">
            {cookiesSaved && (
              <div
                className="govuk-notification-banner govuk-notification-banner--success"
                role="alert"
                aria-labelledby="govuk-notification-banner-title"
                data-module="govuk-notification-banner"
              >
                <div className="govuk-notification-banner__header">
                  <h2
                    className="govuk-notification-banner__title"
                    id="govuk-notification-banner-title"
                  >
                    Success
                  </h2>
                </div>
                <div className="govuk-notification-banner__content">
                  <h3 className="govuk-notification-banner__heading">
                    You&apos;ve set your cookie preferences.
                  </h3>
                </div>
              </div>
            )}

            <h1 className="govuk-heading-xl">
              Cookies on Get adult social care data
            </h1>

            <p className="govuk-body">
              Cookies are small files saved on your phone, tablet or computer
              when you visit a website.
            </p>
            <p className="govuk-body">
              We use cookies to make this site work and collect information
              about how you use our service.
            </p>

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
                      <td className="govuk-table__cell">
                        {COOKIE_CONSENT_NAME}
                      </td>
                      <td className="govuk-table__cell">
                        This cookie tracks whether you have accepted or rejected
                        analytical cookies.
                      </td>
                      <td className="govuk-table__cell">1 Year</td>
                    </tr>
                    <tr className="govuk-table__row">
                      <td className="govuk-table__cell">
                        __Secure-better-auth.state
                      </td>
                      <td className="govuk-table__cell">
                        Manages your login session and ensures the sign-in
                        process functions correctly
                      </td>
                      <td className="govuk-table__cell">3 days</td>
                    </tr>
                    <tr className="govuk-table__row">
                      <td className="govuk-table__cell">
                        __Secure-better-auth.session-data
                      </td>
                      <td className="govuk-table__cell">
                        Manages your login session and ensures the sign-in
                        process functions correctly
                      </td>
                      <td className="govuk-table__cell">
                        5 minutes from last use
                      </td>
                    </tr>
                    <tr className="govuk-table__row">
                      <td className="govuk-table__cell">
                        __Secure-better-auth.session-token
                      </td>
                      <td className="govuk-table__cell">
                        Manages your login session and ensures the sign-in
                        process functions correctly
                      </td>
                      <td className="govuk-table__cell">
                        1 hour from last use
                      </td>
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
              Analytics cookies (Azure App Insights)
            </h3>
            <p className="govuk-body">
              We use Azure App Insights software to collect information about
              how you use this service and help us make it better. We do not
              allow Microsoft to use or share this data.
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
                      <td className="govuk-table__cell">ai_session</td>
                      <td className="govuk-table__cell">
                        Application Insights tracking cookie
                      </td>
                      <td className="govuk-table__cell">
                        30 mins after last activity
                      </td>
                    </tr>
                    <tr className="govuk-table__row">
                      <td className="govuk-table__cell">ai_user</td>
                      <td className="govuk-table__cell">
                        Application Insights tracking cookie
                      </td>
                      <td className="govuk-table__cell">1 year</td>
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
                        checked={selectedCookiesConsent}
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
                        checked={!selectedCookiesConsent}
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
