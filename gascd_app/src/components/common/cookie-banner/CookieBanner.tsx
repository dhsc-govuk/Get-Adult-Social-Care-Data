'use client';

import React, { useEffect, useState } from 'react';
import Cookies from 'js-cookie';
import { COOKIE_CONSENT_NAME } from '../../../../constants';

const CookieBanner: React.FC = () => {
  const [selectedCookiesConsent, setSelectedCookiesConsent] =
    useState<boolean>(false);
  const [showCookieBanner, setShowCookieBanner] = useState<boolean>(false);
  const [showCookiesAcceptedMessage, setShowCookiesAcceptedMessage] =
    useState<boolean>(false);
  const [showCookiesRejectedMessage, setShowCookiesRejectedMessage] =
    useState<boolean>(false);

  useEffect(() => {
    if (Cookies.get(COOKIE_CONSENT_NAME) === undefined) {
      setShowCookieBanner(true);
    }
  }, []);

  const hideBanner = () => {
    setShowCookieBanner(false);
    setShowCookiesAcceptedMessage(false);
    setShowCookiesRejectedMessage(false);
  };

  const handleReject = () => {
    Cookies.set(COOKIE_CONSENT_NAME, 'false', { expires: 365 });
    setSelectedCookiesConsent(false);
    setShowCookieBanner(false);
    setShowCookiesRejectedMessage(true);
    setShowCookiesAcceptedMessage(false);
  };

  const handleAccept = () => {
    Cookies.set(COOKIE_CONSENT_NAME, 'true', { expires: 365 });
    setSelectedCookiesConsent(true);
    setShowCookieBanner(false);
    setShowCookiesAcceptedMessage(true);
    setShowCookiesRejectedMessage(false);
  };

  return (
    <>
      {showCookieBanner && (
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
                onClick={() => handleAccept()}
              >
                Accept analytics cookies
              </button>
              <button
                value="no"
                type="submit"
                name="cookies[analytics]"
                className="govuk-button"
                data-module="govuk-button"
                onClick={() => handleReject()}
              >
                Reject analytics cookies
              </button>
              <a className="govuk-link" href="/cookies">
                View cookies
              </a>
            </div>
          </div>
        </div>
      )}

      {showCookiesAcceptedMessage && (
        <div
          className="govuk-cookie-banner"
          data-nosnippet
          role="region"
          aria-label="Cookies on Get adult social care data"
        >
          <div
            className="govuk-cookie-banner__message govuk-width-container"
            id="cookie-accept-message"
          >
            <div className="govuk-grid-row">
              <div className="govuk-grid-column-two-thirds">
                <div className="govuk-cookie-banner__content">
                  <p className="govuk-body">
                    You&apos;ve accepted analytics cookies. You can{' '}
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
      )}

      {showCookiesRejectedMessage && (
        <div
          className="govuk-cookie-banner"
          data-nosnippet
          role="region"
          aria-label="Cookies on Get adult social care data"
        >
          <div
            className="govuk-cookie-banner__message govuk-width-container"
            id="cookie-reject-message"
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
      )}
    </>
  );
};

export default CookieBanner;
