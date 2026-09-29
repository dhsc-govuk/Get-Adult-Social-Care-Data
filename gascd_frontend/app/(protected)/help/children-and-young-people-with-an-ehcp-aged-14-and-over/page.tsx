import Layout from '@/components/common/layout/Layout';
import DataIndicatorDetails from '@/components/data-components/DataIndicatorDetails';
import Link from 'next/link';

const ChildrenAndYoungPeopleWithAnEhcp: React.FC = () => {
  return (
    <>
      <Layout
        title="Children and young people with an EHCP, aged 14 and over"
        showLoginInformation={false}
        backURL="/topics/future-planning/sen-and-ehcp/data"
        currentPage={'children and young people with an EHCP, aged 14 and over'}
      >
        <DataIndicatorDetails
          title="Children and young people with an EHCP, aged 14 and over"
          whatThisMeasures={
            <p className="govuk-!-margin-top-0">
              The number of children and young people aged 14 and over in the
              selected administrative area within England who have a legally
              binding Education, Health and Care Plan (EHCP) over an academic
              year. It is shown for the local authority, its region and England,
              both over time and broken down by single year of age.
            </p>
          }
          source={
            <>
              <Link
                href="https://explore-education-statistics.service.gov.uk/find-statistics/education-health-and-care-plans"
                className="govuk-link"
                target="_blank"
              >
                Education, Health and Care Plans in England from the Department
                for Education (opens in new tab)
              </Link>
            </>
          }
          updateFrequency="Yearly updates"
          methodology={
            <p className="govuk-!-margin-top-0">
              The Department for Education collects this data from local
              authorities through the SEN2 return, which counts the plans each
              local authority maintains as at January each year. Plans are
              attributed to the local authority that maintains them. Regional
              and England figures are the totals for all local authorities
              within them.
            </p>
          }
          limitations={
            <p className="govuk-!-margin-top-0">
              Plans are counted against the local authority that maintains them,
              which is not always the local authority the child or young person
              lives in. An EHCP can be maintained up to age 25, so the older age
              groups depend on how long local authorities keep plans in place.
              See the data source for full details.
            </p>
          }
          dataDefinitions={
            <p className="govuk-!-margin-top-0">
              An Education, Health and Care Plan (EHCP) is a legally binding
              document describing the education, health and social care support
              a child or young person aged up to 25 needs, where that support
              cannot be provided through SEN support alone.
            </p>
          }
        />
      </Layout>
    </>
  );
};

export default ChildrenAndYoungPeopleWithAnEhcp;
