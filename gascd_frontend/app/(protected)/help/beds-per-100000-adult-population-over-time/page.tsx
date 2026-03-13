import Layout from '@/components/common/layout/Layout';
import DataIndicatorDetails from '@/components/data-components/DataIndicatorDetails';
import Link from 'next/link';

const BedsPer100000AdultPopulation: React.FC = () => {
  return (
    <>
      <Layout
        title="Adult social care beds per 100,000 adult population - over time"
        showLoginInformation={false}
        backURL="/topics/residential-care/provision-and-occupancy/data"
        currentPage={'beds per 100,000 adult population - over time'}
      >
        <DataIndicatorDetails
          title="Adult social care beds per 100,000 adult population - over time"
          whatThisMeasures={
            <p className="govuk-!-margin-top-0">
              The total number of adult social care beds in a specific care
              provider&apos;s <abbr title="Local Authority">LA</abbr> area by
              type, over time.
            </p>
          }
          source={
            <>
              <Link
                href="https://www.necsu.nhs.uk/digital-applications/capacity-tracker/"
                className="govuk-link"
                target="_blank"
              >
                Capacity Tracker (opens in new tab)
              </Link>
              <span>, </span>
              <Link
                href="https://www.ons.gov.uk/peoplepopulationandcommunity/populationandmigration/populationestimates/bulletins/populationestimatesforenglandandwales/mid2023"
                className="govuk-link"
                target="_blank"
              >
                Office for National Statistics (opens in new tab)
              </Link>
            </>
          }
          updateFrequency="Daily"
          methodology={
            <>
              <p className="govuk-body">
                This indicator counts all beds reported by care providers that
                are related to adult social care, including the following
                categories:
              </p>
              <ul className="govuk-list govuk-list--bullet">
                <li>community care</li>
                <li>dementia residential</li>
                <li>dementia nursing</li>
                <li>general nursing</li>
                <li>general residential</li>
                <li>learning disability nursing</li>
                <li>learning disability residential</li>
                <li>mental health nursing</li>
                <li>mental health residential</li>
                <li>transitional care</li>
                <li>young physically disabled</li>
              </ul>
              <p className="govuk-body">
                The data covers both self-funded and{' '}
                <abbr title="Local Authority">LA</abbr>-funded beds.
              </p>
              <p className="govuk-body">
                Care providers registered with the Care Quality Commission (CQC)
                must update this information at least monthly using the Capacity
                Tracker tool. The mandated reporting period is between the 8th
                and 14th every month, or the next working day if the 14th falls
                on a weekend or holiday.
              </p>
              <p className="govuk-body">
                Bed counts are suppressed at provider location level where they
                fall below 6, to protect the confidentiality of individuals. At
                local authority, regional, and national level, figures are also
                suppressed where there are too few care providers contributing
                to a total, to avoid identification of individual provider
                figures by subtraction. Suppressed values appear as 0. The Isles
                of Scilly are excluded at all geographic levels. All figures are
                rounded to the nearest whole.
              </p>
            </>
          }
          limitations={
            <>
              <p className="govuk-body">
                Care providers may update their Capacity Tracker data at
                different times outside the reporting period.
              </p>
              <p className="govuk-body">
                As a result, the data does not provide a snapshot of all
                providers at the same time. It reflects the most recent
                information available when the data was retrieved.
              </p>
              <p className="govuk-body">
                The data is self-reported and not independently verified.
              </p>
              <p className="govuk-body">
                When adult social care beds are vacant, they can be used
                flexibly across a range of bed types. We are exploring ways to
                reflect this in the data.
              </p>
              <p className="govuk-body">
                The current bed types are not clearly defined and may be
                interpreted differently by care providers submitting data. To
                improve consistency, we are working with Capacity Tracker to
                explore whether more detailed bed descriptions can be provided.
              </p>
            </>
          }
        />
      </Layout>
    </>
  );
};

export default BedsPer100000AdultPopulation;
