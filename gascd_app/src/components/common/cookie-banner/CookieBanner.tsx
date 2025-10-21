import React, { useState } from 'react';

const CookieBanner: React.FC = () => {
  const [selectedCookiesConsent, setSelectedCookiesConsent] =
    useState<boolean>();

  const handleSubmit = () => {
    if (selectedCookiesConsent) {
      document
        .getElementById('cookie-accept-message')!
        .removeAttribute('hidden');
      document
        .querySelector('.govuk-cookie-banner__message')!
        .setAttribute('hidden', 'true');
      console.log('Cookies Approved');
    } else {
      document
        .getElementById('cookie-reject-message')!
        .removeAttribute('hidden');
      document
        .querySelector('.govuk-cookie-banner__message')!
        .setAttribute('hidden', 'true');
      console.log('Cookies Rejected');
    }
  };

  const hideBanner = () => {
    document
      .querySelector('.govuk-cookie-banner')!
      .setAttribute('hidden', 'true');
  };

  return (
    <div
      className="govuk-cookie-banner"
      data-nosnippet
      role="region"
      aria-label="Cookies on Get adult social care data"
    >
      <div className="govuk-cookie-banner__message govuk-width-container">
        <div className="govuk-grid-row">
          <div className="govuk-grid-column-two-thirds">
            <h2 className="govuk-cookie-banner__heading govuk-heading-m">
              Cookies on Get adult social care data
            </h2>
            <div className="govuk-cookie-banner__content">
              <p className="govuk-body">
                We use some essential cookies to make this service work.
              </p>
              <p className="govuk-body">
                We&apos;d also like to use analytics cookies so we can
                understand how you use the service and make improvements.
              </p>
            </div>
          </div>
        </div>
        <div className="govuk-button-group">
          <button
            value="yes"
            type="submit"
            name="cookies[analytics]"
            className="govuk-button"
            data-module="govuk-button"
            onClick={() => handleSubmit()}
          >
            Accept analytics cookies
          </button>
          <button
            value="no"
            type="submit"
            name="cookies[analytics]"
            className="govuk-button"
            data-module="govuk-button"
            onClick={() => handleSubmit()}
          >
            Reject analytics cookies
          </button>
          <a className="govuk-link" href="/cookies">
            View cookies
          </a>
        </div>
      </div>
      <div
        className="govuk-cookie-banner__message govuk-width-container"
        id="cookie-accept-message"
        hidden
      >
        <div className="govuk-grid-row">
          <div className="govuk-grid-column-two-thirds">
            <div className="govuk-cookie-banner__content">
              <p className="govuk-body">
                You&apos;ve accepted additional cookies. You can{' '}
                <a className="govuk-link" href="/cookies">
                  change your cookie settings
                </a>{' '}
                at any time.
              </p>
            </div>
          </div>
        </div>
        <div className="govuk-button-group">
          <button
            value="yes"
            type="submit"
            name="cookies[hide]"
            className="govuk-button"
            data-module="govuk-button"
            onClick={() => hideBanner()}
          >
            Hide cookie message
          </button>
        </div>
      </div>
      <div
        className="govuk-cookie-banner__message govuk-width-container"
        id="cookie-reject-message"
        hidden
      >
        <div className="govuk-grid-row">
          <div className="govuk-grid-column-two-thirds">
            <div className="govuk-cookie-banner__content">
              <p className="govuk-body">
                You&apos;ve rejected analytics cookies. You can{' '}
                <a className="govuk-link" href="/cookies">
                  change your cookie settings
                </a>{' '}
                at any time.
              </p>
            </div>
          </div>
        </div>
        <div className="govuk-button-group">
          <button
            value="yes"
            type="submit"
            name="cookies[hide]"
            className="govuk-button"
            data-module="govuk-button"
            onClick={() => hideBanner()}
          >
            Hide cookie message
          </button>
        </div>
      </div>
    </div>
  );
};

export default CookieBanner;
