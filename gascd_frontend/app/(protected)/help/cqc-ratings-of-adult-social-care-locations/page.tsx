import Layout from '@/components/common/layout/Layout';
import DataIndicatorDetails from '@/components/data-components/DataIndicatorDetails';
import Link from 'next/link';

const CQCRatingsOfAdultSocialCareLocations: React.FC = () => {
  return (
    <>
      <Layout
        title="CQC ratings of adult social care locations"
        showLoginInformation={false}
        backURL="/topics/quality-of-care/cqc-ratings/data"
        currentPage={'cqc ratings of adult social care locations'}
      >
        <DataIndicatorDetails
          title="CQC ratings of adult social care locations"
          whatThisMeasures={
            <p className="govuk-!-margin-top-0">
              The number of adult social care locations registered with the Care
              Quality Commission (CQC) within the
              selected administrative area that hold each overall rating
              (Outstanding, Good, Requires improvement, Inadequate, or
              Insufficient evidence to rate), and the percentage of rated
              locations that each rating makes up.
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
              care directory with filters. Locations are counted against the
              local authority they are registered in, and the counts are summed
              for the region and for England. The percentage for a rating is the
              number of locations with that rating divided by the number of
              rated locations in the area. Locations that have not yet been
              inspected are not included in the rated total.
            </p>
          }
          limitations={
            <p className="govuk-!-margin-top-0">
              A rating reflects the location&apos;s most recent inspection,
              which may be some time ago. Newly registered locations have no
              rating until they are inspected. See data source for details.
            </p>
          }
        />
      </Layout>
    </>
  );
};

export default CQCRatingsOfAdultSocialCareLocations;
