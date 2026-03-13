import Layout from '@/components/common/layout/Layout';
import DataIndicatorDetails from '@/components/data-components/DataIndicatorDetails';
import Link from 'next/link';

const PercentageBedsOccupied: React.FC = () => {
  return (
    <>
      <Layout
        title="Percentage of adult social care beds occupied"
        showLoginInformation={false}
        backURL="/topics/residential-care/provision-and-occupancy/data"
        currentPage={'percentage beds occupied'}
      >
        <DataIndicatorDetails
          title="Percentage of adult social care beds occupied"
          whatThisMeasures={
            <p className="govuk-!-margin-top-0">
              The percentage of occupied beds, in relevant bed types, in care
              providers registered with the Care Quality Commission (CQC).
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
            </>
          }
          updateFrequency="Daily"
          methodology={
            <>
              <p className="govuk-!-margin-top-0">
                The occupancy rate is calculated by dividing the number of
                occupied beds by the total number of beds. ‘Beds’ refers to
                adult social care beds in care providers and includes the
                following categories:
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
                ‘Occupied beds’ refers to beds reported as being in use at the
                time of data collection.
              </p>
              <p className="govuk-!-margin-top-0">
                Care providers registered with the{' '}
                <abbr title="Care Quality Commission">CQC</abbr> must update
                this information at least monthly using the Capacity Tracker
                tool. The mandated reporting period is between the 8th and 14th
                every month, or the next working day if the 14th falls on a
                weekend or holiday.
              </p>
              <p className="govuk-!-margin-top-0">
                Bed counts and occupied bed counts are suppressed at provider
                location level where they fall below 6, to protect the
                confidentiality of individuals, along with their corresponding
                percentages. At local authority, regional, and national level,
                figures are also suppressed where there are too few care
                providers contributing to a total, to avoid identification of
                individual provider figures by subtraction. Suppressed values
                appear as 0. The Isles of Scilly are excluded at all geographic
                levels.
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
            </>
          }
        />
      </Layout>
    </>
  );
};

export default PercentageBedsOccupied;
