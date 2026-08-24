import React from 'react';
import Layout from '@/components/common/layout/Layout';

type Props = {
  searchParams: Promise<{ sref?: string }>;
};
const ConfirmLAPage: React.FC<Props> = async ({ searchParams }) => {
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
              We've sent your application to the DHSC team.
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
