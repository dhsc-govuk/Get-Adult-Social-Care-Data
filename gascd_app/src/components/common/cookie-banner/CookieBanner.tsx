import React from 'react';

const CookieBanner: React.FC = () => {
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
                We’d like to set additional cookies so we can remember your
                settings, understand how people use the service and make
                improvements.
              </p>
            </div>
          </div>
        </div>
        <div className="govuk-button-group">
          <button
            value="yes"
            type="submit"
            name="cookies[additional]"
            className="govuk-button"
            data-module="govuk-button"
          >
            Accept additional cookies
          </button>
          <button
            value="no"
            type="submit"
            name="cookies[additional]"
            className="govuk-button"
            data-module="govuk-button"
          >
            Reject additional cookies
          </button>
          <a className="govuk-link" href="/cookies">
            View cookies
          </a>
        </div>
      </div>
      <div
        className="govuk-cookie-banner__message govuk-width-container"
        hidden
      >
        <div className="govuk-grid-row">
          <div className="govuk-grid-column-two-thirds">
            <div className="govuk-cookie-banner__content">
              <p className="govuk-body">
                You’ve accepted additional cookies. You can{' '}
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
          >
            Hide cookie message
          </button>
        </div>
      </div>
      <div
        className="govuk-cookie-banner__message govuk-width-container"
        hidden
      >
        <div className="govuk-grid-row">
          <div className="govuk-grid-column-two-thirds">
            <div className="govuk-cookie-banner__content">
              <p className="govuk-body">
                You’ve rejected additional cookies. You can{' '}
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
          >
            Hide cookie message
          </button>
        </div>
      </div>
    </div>
  );
};

export default CookieBanner;
