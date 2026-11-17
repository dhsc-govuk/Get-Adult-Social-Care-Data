import Layout from '@/components/common/layout/Layout';
import DataIndicatorDetails from '@/components/data-components/DataIndicatorDetails';
import Link from 'next/link';

const InspectionStatusOfAdultSocialCareLocations: React.FC = () => {
  return (
    <>
      <Layout
        title="Inspection status of adult social care locations"
        showLoginInformation={false}
        backURL="/topics/quality-of-care/cqc-ratings/data"
        currentPage={'inspection status of adult social care locations'}
      >
        <DataIndicatorDetails
          title="Inspection status of adult social care locations"
          whatThisMeasures={
            <p className="govuk-!-margin-top-0">
              The number of active adult social care locations registered with
              the Care Quality Commission (CQC) within the selected
              administrative area that have been inspected and that have not yet
              been inspected, and the percentage of all locations that each
              group makes up.
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
              care directory with filters. A location is counted as inspected if
              it has a rating of Outstanding, Good, Requires improvement,
              Inadequate or Insufficient evidence to rate. All other locations
              are counted as not yet inspected. Locations are counted against
              the local authority they are registered in, and the counts are
              summed for the region and for England. The percentage is the
              number of locations with that inspection status divided by the
              number of all active locations in the area.
            </p>
          }
          limitations={
            <>
              <p className="govuk-!-margin-top-0">
                Newly registered locations are counted as not yet inspected
                until they receive a rating. Inspection status is based on
                whether a location has a rating, so a location that CQC has
                checked but not rated is counted as not yet inspected. See data
                source for details.
              </p>
              <ul className="govuk-list govuk-list--bullet">
                <li>
                  Registered office location: A provider&apos;s registered
                  location with CQC is the location of their registered office,
                  and this is how providers are allocated to a given LA and/or
                  region. This may not reflect the actual location where adult
                  social care is delivered, as not all providers operate in the
                  same area as their registered office.
                </li>
                <li>
                  Currency of registration data: Information held by CQC may not
                  reflect the current services provided by a care provider, as
                  it is collected at registration and may not be regularly
                  updated.
                </li>
                <li>
                  Aggregated quality ratings reflect a mix of legacy CQC
                  inspections and newer Single Assessment Framework (SAF)
                  assessments. Because SAF assessments have been conducted at a
                  time of fewer inspections within a risk-based system, and
                  their methodology is different, tend to produce lower ratings
                  on average, older and newer ratings are not directly
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

export default InspectionStatusOfAdultSocialCareLocations;
