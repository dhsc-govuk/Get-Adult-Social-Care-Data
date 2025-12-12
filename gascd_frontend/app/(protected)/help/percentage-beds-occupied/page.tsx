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
            <p>
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
              <p>
                The occupancy rate is calculated by dividing the number of
                occupied beds by the total number of beds. &lsquo;Beds&rsquo;
                refers to adult social care beds in care providers and includes
                the following categories:
              </p>
              <ul className="govuk-list govuk-list--bullet">
                <li>general residential</li>
                <li>general nursing</li>
                <li>dementia residential</li>
                <li>dementia nursing</li>
                <li>mental health residential</li>
                <li>mental health nursing</li>
                <li>learning disability residential</li>
                <li>learning disability nursing</li>
                <li>transitional care</li>
                <li>young physically disabled</li>
              </ul>
              <p>
                &lsquo;Occupied beds&rsquo; refers to beds reported as being in
                use at the time of data collection.
              </p>
              <p>
                Care providers registered with the Care Quality Commission (CQC)
                must update this information at least monthly using the Capacity
                Tracker tool. The mandated reporting period is between the 8th
                and 14th every month, or the next working day if the 14th falls
                on a weekend or holiday.
              </p>
              <p>
                Small number suppression is applied. Occupied bed counts less
                than 5 and their corresponding percentages have been suppressed.
              </p>
            </>
          }
          limitations={
            <>
              <p>
                Care providers may update their Capacity Tracker data at
                different times outside the reporting period.
              </p>
              <p>
                As a result, the data does not provide a snapshot of all
                providers at the same time. It reflects the most recent
                information available when the data was retrieved.
              </p>
              <p>
                The data is self&#45;reported and not independently verified.
              </p>
              <p>
                When adult social care beds are vacant, they can be used
                flexibly across a range of bed types. We are exploring ways to
                reflect this in the data.
              </p>
              <p>
                The current bed types are not clearly defined and may be
                interpreted differently by care providers submitting data. To
                improve consistency, we are working with Capacity Tracker to
                explore whether more detailed bed descriptions can be provided.
              </p>
            </>
          }
          dataDefinitions={
            <p>
              Refer to the Limitations section for details about work relating
              to bed type descriptions.
            </p>
          }
        />
      </Layout>
    </>
  );
};

export default PercentageBedsOccupied;
