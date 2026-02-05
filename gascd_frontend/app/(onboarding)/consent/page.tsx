'use client';

import React, { useEffect, useState } from 'react';
import Layout from '../../../src/components/common/layout/Layout';
import { useRouter } from 'next/navigation';
import { useSession, authClient } from '@/lib/auth-client';

const ConsentPage: React.FC = () => {
  const { data: session } = useSession();
  const router = useRouter();
  const [consent, setConsent] = useState<boolean | undefined>(undefined);
  const valid_consents: any[] = [true, false];

  useEffect(() => {
    if (
      session?.user &&
      valid_consents.includes(session.user.marketingConsent)
    ) {
      setConsent(session.user.marketingConsent as any);
    }
  }, [session]);

  const handleSubmit = async () => {
    if (valid_consents.includes(consent)) {
      await authClient.updateUser({
        marketingConsent: consent,
      });
      router.push('/home#top');
    }
  };

  return (
    <Layout
      title="Do you want to receive email updates about this service?"
      showLoginInformation={false}
      currentPage="consent"
    >
      <div className="govuk-grid-row">
        <div className="govuk-grid-column-two-thirds">
          <form action="/first-login-complete" method="post">
            <div className="govuk-form-group">
              <fieldset
                className="govuk-fieldset"
                aria-describedby="marketing-consent-hint"
              >
                <legend className="govuk-fieldset__legend govuk-fieldset__legend--xl govuk-!-padding-bottom-6">
                  <h1 className="govuk-fieldset__heading">
                    Do you want to receive email updates about this service?
                  </h1>
                </legend>

                <div id="marketing-consent-hint" className="govuk-hint">
                  <p className="govuk-body">
                    We can send you emails about &lsquo;Get adult social care
                    data&rsquo;, including new features and opportunities to
                    take part in user research.
                  </p>
                  <p className="govuk-body">
                    <a
                      href="/privacy-policy"
                      className="govuk-link"
                      target="_blank"
                    >
                      Read our privacy policy (opens in new tab)
                    </a>{' '}
                    to find out how we use your personal information.
                  </p>
                </div>

                <div
                  className="govuk-radios"
                  data-module="govuk-radios"
                  data-govuk-radios-init=""
                >
                  <div className="govuk-radios__item">
                    <input
                      className="govuk-radios__input"
                      id="marketing-consent"
                      name="marketing-consent"
                      type="radio"
                      value="yes"
                      checked={consent === true}
                      onChange={() => {
                        setConsent(true);
                      }}
                    />
                    <label
                      className="govuk-label govuk-radios__label"
                      htmlFor="marketing-consent"
                    >
                      Yes, I want to receive email updates
                    </label>
                  </div>

                  <div className="govuk-radios__item">
                    <input
                      className="govuk-radios__input"
                      id="marketing-consent-2"
                      name="marketing-consent"
                      type="radio"
                      value="no"
                      checked={consent === false}
                      onChange={() => {
                        setConsent(false);
                      }}
                    />
                    <label
                      className="govuk-label govuk-radios__label"
                      htmlFor="marketing-consent-2"
                    >
                      No, I do not want to receive email updates
                    </label>
                  </div>
                </div>
              </fieldset>
            </div>

            <p className="govuk-body">
              You can unsubscribe at any time using the link at the bottom of
              our emails.
            </p>
            <button
              type="button"
              className="govuk-button"
              onClick={() => handleSubmit()}
              disabled={consent === undefined}
            >
              Continue
            </button>
          </form>
        </div>
      </div>
    </Layout>
  );
};

export default ConsentPage;
