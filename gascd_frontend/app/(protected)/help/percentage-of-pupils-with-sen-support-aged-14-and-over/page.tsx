import Layout from '@/components/common/layout/Layout';
import DataIndicatorDetails from '@/components/data-components/DataIndicatorDetails';
import Link from 'next/link';

const PercentageOfPupilsWithSenSupport: React.FC = () => {
  return (
    <>
      <Layout
        title="Percentage of pupils with SEN support, aged 14 and over"
        showLoginInformation={false}
        backURL="/topics/future-planning/sen-and-ehcp/data"
        currentPage={'percentage of pupils with SEN support, aged 14 and over'}
      >
        <DataIndicatorDetails
          title="Percentage of pupils with SEN support, aged 14 and over"
          whatThisMeasures={
            <p className="govuk-!-margin-top-0">
              The proportion of pupils aged 14 and over in the selected
              administrative area within England who are identified as having a
              special educational need (SEN) over an academic year. It is shown
              for the local authority, its region and England, both over time
              and broken down by single year of age.
            </p>
          }
          source={
            <>
              <Link
                href="https://explore-education-statistics.service.gov.uk/find-statistics/special-educational-needs-in-england"
                className="govuk-link"
                target="_blank"
              >
                Special educational needs in England from the Department for
                Education (opens in new tab)
              </Link>
            </>
          }
          updateFrequency="Yearly updates"
          methodology={
            <p className="govuk-!-margin-top-0">
              The number of pupils aged 14 and over identified as having a
              special educational need is divided by the total number of pupils
              of the same age recorded in the school census for that area, and
              expressed as a percentage. Regional and England figures are
              calculated from the totals for all local authorities within them,
              rather than as an average of local authority percentages.
            </p>
          }
          limitations={
            <p className="govuk-!-margin-top-0">
              Pupils are counted where their school is, which is not always the
              local authority they live in. Percentages for a single year of age
              can move sharply in smaller areas, where the number of pupils
              involved is low. See the data source for full details.
            </p>
          }
          dataDefinitions={
            <p className="govuk-!-margin-top-0">
              A special educational need (SEN) is a learning difficulty or
              disability that calls for special educational provision. SEN
              support is the help given by a school to a pupil with SEN who does
              not have an Education, Health and Care Plan (EHCP).
            </p>
          }
        />
      </Layout>
    </>
  );
};

export default PercentageOfPupilsWithSenSupport;
