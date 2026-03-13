import Layout from '@/components/common/layout/Layout';
import DataIndicatorDetails from '@/components/data-components/DataIndicatorDetails';
import Link from 'next/link';

const TotalNumberCommunitySocialCareProvidersPage: React.FC = () => {
  return (
    <>
      <Layout
        title="Number of adult social care providers"
        showLoginInformation={false}
        currentPage={'number-community-social-care-providers'}
        backURL="/service-information/data-indicator-details"
      >
        <DataIndicatorDetails
          title="Number of adult social care providers"
          whatThisMeasures={
            <p className="govuk-!-margin-top-0">
              The total number of care providers registered as adult social care
              providers with the Care Quality Commission (CQC). This includes
              care home providers and community based social care providers.
            </p>
          }
          source={
            <Link
              href="https://www.cqc.org.uk/about-us/transparency/using-cqc-data"
              className="govuk-link"
              target="_blank"
            >
              Care Directory from the CQC (opens in new tab)
            </Link>
          }
          updateFrequency="Monthly"
          methodology={
            <>
              <p className="govuk-body">
                The total number of adult social care providers is calculated by
                summing the total number of providers registered across the
                following categories with the{' '}
                <abbr title="Care Quality Commission">CQC</abbr>.
              </p>
              <p className="govuk-body">Care home providers:</p>
              <ul className="govuk-list--bullet">
                <li>Residential care providers</li>
                <li>Nursing care providers</li>
              </ul>
              <p className="govuk-body">
                Community based social care providers:
              </p>
              <ul className="govuk-list--bullet">
                <li>Home care providers</li>
                <li>Supported living providers</li>
                <li>Extra care housing providers</li>
                <li>
                  Other community based social care providers (including those
                  non-NHS providers that provide community services or those
                  providers that provide shared lives services)
                </li>
              </ul>
              <p className="govuk-body">
                These categories are not mutually exclusive. A single provider
                may be registered to deliver more than one type of adult social
                care and will therefore appear in multiple category counts. For
                example, a provider registered with{' '}
                <abbr title="Care Quality Commission">CQC</abbr> as offering
                both extra care housing and supported living will be counted
                within both the extra care housing and supported living figures.
                Similarly, a care home provider registered to deliver both
                residential and nursing care will appear in both categories.
              </p>
              <p className="govuk-body">
                As a result, the sum of individual category counts will exceed
                the total number of unique providers. Regional averages are
                calculated by dividing the total count of providers in a region
                by the number of local authorities within that region. National
                averages follow the same logic, dividing the national total by
                the total number of local authorities.
              </p>
            </>
          }
          limitations={
            <>
              <p className="govuk-body">
                Registered office location: A provider&apos;s registered
                location with <abbr title="Care Quality Commission">CQC</abbr>{' '}
                is the location of their registered office, and this is how
                providers are allocated to a given local authority and/or
                region. This may not reflect the actual location where adult
                social care is delivered, as not all providers operate in the
                same area as their registered office.
              </p>
              <p className="govuk-body">
                Currency of registration data: Information held by{' '}
                <abbr title="Care Quality Commission">CQC</abbr> may not reflect
                the current services provided by a care provider, as it is
                collected at registration and may not be regularly updated.
              </p>
            </>
          }
        />
      </Layout>
    </>
  );
};

export default TotalNumberCommunitySocialCareProvidersPage;
