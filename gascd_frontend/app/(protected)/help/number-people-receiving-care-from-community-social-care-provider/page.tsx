import Layout from '@/components/common/layout/Layout';
import DataIndicatorDetails from '@/components/data-components/DataIndicatorDetails';
import Link from 'next/link';

const ReceivingCareFromCommCare: React.FC = () => {
  return (
    <>
      <Layout
        title="Number of people receiving care in the last month from a community social care provider"
        showLoginInformation={false}
        currentPage={'primary-reason-for-accessing-care'}
        backURL="/service-information/data-indicator-details"
      >
        <DataIndicatorDetails
          title="Number of people receiving care in the last month from a community social care provider"
          whatThisMeasures={
            <p className="govuk-!-margin-top-0">
              The total number of people receiving care from care providers
              registered as community social care providers with the Care
              Quality Commission (CQC) as recorded in Capacity Tracker.
            </p>
          }
          source={
            <Link
              href="https://www.necsu.nhs.uk/digital-applications/capacity-tracker/"
              className="govuk-link"
              target="_blank"
            >
              Capacity Tracker from the Department of Health and Social Care
              (opens in new tab)
            </Link>
          }
          updateFrequency="Daily"
          methodology={
            <>
              <p className="govuk-!-margin-top-0">
                This is calculated by summing the total number of people
                receiving care within each provider registered as a community
                social care provider with the Care Quality Commission (CQC).
              </p>
              <p className="govuk-!-margin-top-0">
                Care providers registered with the CQC must update this
                information at least monthly using the Capacity Tracker tool.
                The mandated reporting period is between the 8th and 14th every
                month, or the next working day if the 14th falls on a weekend or
                holiday.
              </p>
              <p className="govuk-!-margin-top-0">
                Small number suppression is applied. All providers with less
                than 6 service users are suppressed and removed from aggregate
                counts to avoid identification.
              </p>
            </>
          }
          limitations={
            <>
              <p className="govuk-!-margin-top-0">
                Care providers may update their Capacity Tracker data at
                different times outside the reporting period.
              </p>
              <p className="govuk-!-margin-top-0">
                As a result, the data does not provide a snapshot of all
                providers at the same time. It reflects the most recent
                information available when the data was retrieved.
              </p>
              <p className="govuk-!-margin-top-0">
                The data is self-reported and not independently verified.
              </p>
            </>
          }
        />
      </Layout>
    </>
  );
};

export default ReceivingCareFromCommCare;
