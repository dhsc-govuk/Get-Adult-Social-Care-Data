import Layout from '@/components/common/layout/Layout';
import DataIndicatorDetails from '@/components/data-components/DataIndicatorDetails';
import Link from 'next/link';

const ChildrenInNeedPer10000Children: React.FC = () => {
  return (
    <>
      <Layout
        title="Children in need per 10,000 children"
        showLoginInformation={false}
        backURL="/topics/future-planning/children-in-need/data"
        currentPage={'children in need per 10,000 children'}
      >
        <DataIndicatorDetails
          title="Children in need per 10,000 children"
          whatThisMeasures={
            <p className="govuk-!-margin-top-0">
              The proportion of the child population in the selected
              administrative area within England that is actively identified as
              a child in need, expressed as a rate per 10,000 children. It is
              shown for the local authority, its region and England over time.
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
              The number of children in need at 31 March is divided by the child
              population of the same area, and multiplied by 10,000. The child
              population comes from Office for National Statistics mid-year
              population estimates for children aged under 18. Expressing the
              figure as a rate makes areas of different sizes comparable.
            </p>
          }
          limitations={
            <p className="govuk-!-margin-top-0">
              The rate depends on both the children in need count and the
              population estimate, so it is affected by revisions to either.
              Local authority assessment practice and thresholds vary between
              areas, so differences in the rate are not necessarily differences
              in need. See the data source for full details.
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

export default ChildrenInNeedPer10000Children;
