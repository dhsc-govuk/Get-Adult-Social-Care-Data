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
            <>
              <p className="govuk-!-margin-top-0">
                The number of children and young people who have a legally
                binding Education, Health and Care (EHC) plan over an academic
                year. This covers all children and young people with an EHC plan
                of ages 0 to 25, including those where the child or young person
                attends early years settings, further education or is educated
                other than in school.
              </p>
              <p className="govuk-!-margin-top-0">
                On this service, figures are shown for those aged 14 and over,
                for the local authority, its region and England, over time and
                by single year of age.
              </p>
            </>
          }
          source={
            <>
              <Link
                href="https://explore-education-statistics.service.gov.uk/find-statistics/education-health-and-care-plans"
                className="govuk-link"
                target="_blank"
              >
                Education, Health and Care Plans in England from the Department
                for Education (DfE) (opens in new tab)
              </Link>
            </>
          }
          updateFrequency="Yearly"
          methodology={
            <>
              <p className="govuk-!-margin-top-0">
                Number of children and young people (ages 0 to 25) in England
                with an education, health and care (EHC) plan.
              </p>
              <p className="govuk-!-margin-top-0">
                The information collected in the SEN2 return is the only source
                of data on all education, health and care (EHC) plans maintained
                by individual local authorities.
              </p>
              <p className="govuk-!-margin-top-0">
                The SEN2 return is a mandatory data collection for all local
                authorities and collects data on all children and young people
                aged between 0 and 25 who have an EHC plan, regardless of where
                they are educated, and includes information on children and
                young people in placements other than in school.
              </p>
            </>
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
