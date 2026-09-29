import Layout from '@/components/common/layout/Layout';
import DataIndicatorDetails from '@/components/data-components/DataIndicatorDetails';
import Link from 'next/link';

const ChildrenInNeed: React.FC = () => {
  return (
    <>
      <Layout
        title="Children in need"
        showLoginInformation={false}
        backURL="/topics/future-planning/children-in-need/data"
        currentPage={'children in need'}
      >
        <DataIndicatorDetails
          title="Children in need"
          whatThisMeasures={
            <p className="govuk-!-margin-top-0">
              The number of children and young people in the selected
              administrative area within England assessed as needing help and
              protection as a result of risks to their development or health
              under the Children Act 1989. It is shown for the local authority,
              its region and England over time.
            </p>
          }
          source={
            <>
              <Link
                href="https://explore-education-statistics.service.gov.uk/find-statistics/children-in-need"
                className="govuk-link"
                target="_blank"
              >
                Children in need in England from the Department for Education
                (opens in new tab)
              </Link>
            </>
          }
          updateFrequency="Yearly updates"
          methodology={
            <p className="govuk-!-margin-top-0">
              The Department for Education collects this data from local
              authorities through the children in need census, covering the
              reporting year ending 31 March. The figure counts the children who
              were in need at any point during that year, and is attributed to
              the local authority responsible for the child. Regional and
              England figures are the totals for all local authorities within
              them.
            </p>
          }
          limitations={
            <p className="govuk-!-margin-top-0">
              Counts reflect local authority assessment practice and thresholds,
              which vary between areas, so differences between local authorities
              are not necessarily differences in need. A child supported by more
              than one local authority during the year may appear in each of
              them. See the data source for full details.
            </p>
          }
          dataDefinitions={
            <p className="govuk-!-margin-top-0">
              A child in need is a child assessed under section 17 of the
              Children Act 1989 as unlikely to achieve or maintain a reasonable
              standard of health or development without services from the local
              authority, or as disabled.
            </p>
          }
        />
      </Layout>
    </>
  );
};

export default ChildrenInNeed;
