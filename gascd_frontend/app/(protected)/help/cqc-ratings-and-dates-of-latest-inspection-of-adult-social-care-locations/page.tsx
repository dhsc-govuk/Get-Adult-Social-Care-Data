import Layout from '@/components/common/layout/Layout';
import DataIndicatorDetails from '@/components/data-components/DataIndicatorDetails';
import Link from 'next/link';

const CQCRatingsAndDatesOfLatestInspectionOfAdultSocialCareLocations: React.FC =
  () => {
    return (
      <>
        <Layout
          title="CQC ratings and dates of latest inspection of adult social care locations"
          showLoginInformation={false}
          backURL="/topics/residential-care/residential-care-providers/data"
          currentPage={
            'cqc ratings and dates of latest inspection of adult social care locations'
          }
        >
          <DataIndicatorDetails
            title="CQC ratings and dates of latest inspection of adult social care locations"
            whatThisMeasures={
              <p className="govuk-!-margin-top-0">
                The latest overall rating and the date of the latest inspection
                for each active adult social care location registered with the
                Care Quality Commission (CQC). Locations can be filtered by
                local authority, care provider, service type and rating.
              </p>
            }
            source={
              <>
                <Link
                  href="https://www.cqc.org.uk/about-us/transparency/using-cqc-data"
                  className="govuk-link"
                  target="_blank"
                >
                  Care directory with filters from the Care Quality Commission
                  (opens in new tab)
                </Link>
              </>
            }
            updateFrequency="Monthly"
            methodology={
              <p className="govuk-!-margin-top-0">
                Each location&apos;s latest overall rating is taken from the CQC
                care directory with filters. The date of latest CQC rating publication is
                the &apos;Publication date&apos; of that rating in the CQC care
                directory with filters. Locations with no date are shown as
                &apos;Not yet inspected&apos;.
              </p>
            }
            limitations={
              <>
                <p className="govuk-!-margin-top-0">
                  The date shows when CQC published the location&apos;s latest
                  rating, which may be some time ago. Some locations have a date
                  of latest inspection but no rating. See data source for
                  details.
                </p>
                <ul className="govuk-list govuk-list--bullet">
                  <li>
                    Registered office location: A provider&apos;s registered
                    location with CQC is the location of their registered
                    office, and this is how providers are allocated to a given
                    LA and/or region. This may not reflect the actual location
                    where adult social care is delivered, as not all providers
                    operate in the same area as their registered office.
                  </li>
                  <li>
                    Currency of registration data: Information held by CQC may
                    not reflect the current services provided by a care
                    provider, as it is collected at registration and may not be
                    regularly updated.
                  </li>
                  <li>
                    Aggregated quality ratings reflect a mix of legacy CQC
                    inspections and newer Single Assessment Framework (SAF)
                    assessments. Because SAF assessments have been conducted at
                    a time of fewer inspections within a risk-based system, and
                    their methodology is different, tend to produce lower
                    ratings on average, older and newer ratings are not directly
                    comparable, leading to potential variance between these
                    figures and{' '}
                    <Link
                      href="https://www.cqc.org.uk/publications/major-report/state-care"
                      className="govuk-link"
                      target="_blank"
                    >
                      CQC&apos;s State of Care reporting (opens in new tab)
                    </Link>
                    .
                  </li>
                </ul>
              </>
            }
          />
        </Layout>
      </>
    );
  };

export default CQCRatingsAndDatesOfLatestInspectionOfAdultSocialCareLocations;
