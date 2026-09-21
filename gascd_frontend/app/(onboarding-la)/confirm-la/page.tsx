import React from 'react';
import { notFound } from 'next/navigation';
import Layout from '@/components/common/layout/Layout';

// The request-access form that leads here is not yet built (see
// signup-la/SignupLAForm.tsx). Until it is, this page must not be reachable
// by URL, as its panel would falsely tell a visitor their registration is
// complete. Remove this guard when the form is wired up.
const REQUEST_ACCESS_FORM_ENABLED = false;

type Props = {
  searchParams: Promise<{ sref?: string }>;
};
const ConfirmLAPage: React.FC<Props> = async ({ searchParams }) => {
  if (!REQUEST_ACCESS_FORM_ENABLED) {
    notFound();
  }

  const { sref } = await searchParams;

  return (
    <>
      <Layout
        title="Who Are You?"
        showLoginInformation={false}
        currentPage="whoami"
        showNavBar={false}
      >
        <div className="govuk-grid-row">
          <div className="govuk-grid-column-two-thirds">
            <div className="govuk-panel govuk-panel--confirmation">
              <h1 className="govuk-panel__title">Registration complete</h1>
              <div className="govuk-panel__body">
                Your reference number
                <br />
                <strong>{sref}</strong>
              </div>
            </div>
            <h2 className="govuk-heading-m">What happens next</h2>
            <p className="govuk-body">
              We&apos;ve sent your application to the DHSC team.
            </p>
            <p className="govuk-body">
              They will contact you either to confirm your registration, or to
              ask for more information.
            </p>
            <p className="govuk-body">
              <a href="#" className="govuk-link">
                What did you think of this service?
              </a>{' '}
              (takes 30 seconds)
            </p>
          </div>
        </div>
      </Layout>
    </>
  );
};

export default ConfirmLAPage;
