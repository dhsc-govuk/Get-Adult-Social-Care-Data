import Layout from '@/components/common/layout/Layout';
import DataIndicatorDetails from '@/components/data-components/DataIndicatorDetails';
import Link from 'next/link';

const BedsPer100000AdultPopulation: React.FC = () => {
  return (
    <>
      <Layout
        title="Adult social care beds per 100,000 population"
        showLoginInformation={false}
        backURL="/topics/residential-care/provision-and-occupancy/data"
        currentPage={'beds per 100,000 adult population'}
      >
        <DataIndicatorDetails
          title="Adult social care beds per 100,000 population"
          whatThisMeasures={
            <p className="govuk-!-margin-top-0">
              The total number of adult social care beds recorded by care
              providers across health and adult social care, adjusted to a rate
              per 100,000 people in the selected population (total adult (aged
              18 and over), working age (18 to 64) or aged 65 and over) in the{' '}
              <abbr title="Local Authority">LA</abbr>, regional or national
              population, published by the Office for National Statistics. Shown
              as bar charts and tables, including a table of the 11 individual
              bed types (Table 2b) and one of the 5 bed groupings (Table 3b).
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
              <p className="govuk-!-margin-top-0">
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
              <p className="govuk-!-margin-top-0">
                The data covers both self-funded and{' '}
                <abbr title="Local Authority">LA</abbr>-funded beds.
              </p>
              <p className="govuk-!-margin-top-0">
                Care providers registered with the Care Quality Commission (CQC)
                must update this information at least monthly using the Capacity
                Tracker tool. The mandated reporting period is between the 8th
                and 14th every month, or the next working day if the 14th falls
                on a weekend or holiday.
              </p>
              <p className="govuk-!-margin-top-0">
                Bed counts are suppressed at provider location level where they
                fall below 6, to protect the confidentiality of individuals. At
                local authority, regional, and national level, figures are also
                suppressed where there are too few care providers contributing
                to a total, to avoid identification of individual provider
                figures by subtraction. Suppressed values appear as 0. The Isles
                of Scilly are excluded at all geographic levels. All figures are
                rounded to the nearest whole number.
              </p>
              <p className="govuk-!-margin-top-0">
                Each bed count is divided by the selected population (total
                adult (aged 18 and over), working age (18 to 64) or aged 65 and
                over) and multiplied by 100,000.
              </p>
              <p className="govuk-!-margin-top-0">
                Table 2b shows the 11 categories individually. Table 3b groups
                them into 5 groupings: older people and dementia (general and
                dementia, residential and nursing); learning disability
                (residential and nursing); mental health (residential and
                nursing); young physically disabled; and community care and
                transitional. A grouping&apos;s figure is the sum of its
                categories.
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
              <p className="govuk-!-margin-top-0">
                When adult social care beds are vacant, they can be used
                flexibly across a range of bed types. We are exploring ways to
                reflect this in the data.
              </p>
              <p className="govuk-!-margin-top-0">
                The current bed types are not clearly defined and may be
                interpreted differently by care providers submitting data. To
                improve consistency, we are working with Capacity Tracker to
                explore whether more detailed bed descriptions can be provided.
              </p>
              <p className="govuk-!-margin-top-0">
                The population you choose to standardise by may not include
                everyone in a given bed type. For example, a bed in the young
                physically disabled or working-age groupings may be occupied by
                someone outside the selected age band, so the rate can under- or
                over-state provision for that group. Where possible, read each
                bed type or grouping against the population that best fits it.
              </p>
            </>
          }
        />
      </Layout>
    </>
  );
};

export default BedsPer100000AdultPopulation;
