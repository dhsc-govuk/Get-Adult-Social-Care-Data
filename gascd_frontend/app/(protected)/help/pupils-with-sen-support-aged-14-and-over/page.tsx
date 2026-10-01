import Layout from '@/components/common/layout/Layout';
import DataIndicatorDetails from '@/components/data-components/DataIndicatorDetails';
import Link from 'next/link';

const PupilsWithSenSupport: React.FC = () => {
  return (
    <>
      <Layout
        title="Pupils with SEN support, aged 14 and over"
        showLoginInformation={false}
        backURL="/topics/future-planning/sen-and-ehcp/data"
        currentPage={'pupils with SEN support, aged 14 and over'}
      >
        <DataIndicatorDetails
          title="Pupils with SEN support, aged 14 and over"
          whatThisMeasures={
            <>
              <p className="govuk-!-margin-top-0">
                The number of pupils who are identified as having a special
                educational need (SEN) over an academic year. It is provided for
                pupils who are identified as having a learning difficulty or a
                disability that requires extra or different help to that
                normally provided as part of the school&apos;s usual curriculum
                offer. A pupil with SEN support will not have an education,
                health and care plan.
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
                href="https://explore-education-statistics.service.gov.uk/find-statistics/special-educational-needs-in-england"
                className="govuk-link"
                target="_blank"
              >
                Special educational needs in England from the Department for
                Education (DfE) (opens in new tab)
              </Link>
            </>
          }
          updateFrequency="Yearly"
          methodology={
            <p className="govuk-!-margin-top-0">
              The total number of pupils in England with SEN support in an
              academic year. This includes all state-funded nursery, primary,
              secondary and special schools, non-maintained special schools,
              pupil referral units and independent schools.
            </p>
          }
          limitations={
            <>
              <p className="govuk-!-margin-top-0">
                If a pupil is &lsquo;rolled-off&rsquo; before the January Census
                (i.e. pupils who have been excluded mid-year), they will not be
                counted in the total number of pupils with SEN support.
              </p>
              <p className="govuk-!-margin-top-0">
                This does not include those in non-maintained early years
                provision, further education, home education or not in
                education, employment or training.
              </p>
              <p className="govuk-!-margin-top-0">
                SEN figures for pupils aged 16+ only cover those attending
                school-based post-16 provision (e.g. school sixth forms) via the
                School Census. Because this excludes pupils attending FE or
                sixth form colleges, the data shows a sharp drop-off after age
                15 and does not reflect total post-16 SEN provision across all
                educational settings.
              </p>
            </>
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

export default PupilsWithSenSupport;
