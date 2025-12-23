import Layout from '@/components/common/layout/Layout';
import DataIndicatorDetails from '@/components/data-components/DataIndicatorDetails';
import Link from 'next/link';

const LearningDisabilityPrevalence = () => {
  return (
    <>
      <Layout
        title="Learning disability prevalence"
        backURL="/topics/population-needs/disability-prevalence/data"
      >
        <DataIndicatorDetails
          title="Learning disability prevalence"
          whatThisMeasures={
            <p className="govuk-!-margin-top-0">
              The percentage of people registered with a GP within the selected
              administrative area within England who have a recorded diagnosis
              of learning disability, covering all ages.
            </p>
          }
          source={
            <Link
              href="https://fingertips.phe.org.uk/search/learning#page/4/gid/1/pat/159/par/K02000001/ati/15/are/E92000001/iid/200/age/1/sex/4/cat/-1/ctp/-1/yrr/1/cid/4/tbm/1"
              className="govuk-link"
              target="_blank"
            >
              Fingertips from the Department of Health and Social Care (opens in
              new tab)
            </Link>
          }
          updateFrequency="Yearly"
          methodology={
            <p className="govuk-!-margin-top-0">
              Based on Quality and Outcomes Framework (QOF) data, this measure
              calculates the proportion of patients recorded on GP practice
              registers as having a learning disability. The data is aggregated
              to local authority level using the postcode of the GP practice,
              rather than the patient&apos;s place of residence.
            </p>
          }
          limitations={
            <p className="govuk-!-margin-top-0">
              The measure is intended to show the prevalence of learning
              disabilities among residents of each local authority area.
              However, data by place of residence is not available. Instead, a
              proxy is used based on GP registrations, assigning individuals to
              a local authority according to the postcode of their GP practice
              rather than their home address.
            </p>
          }
          dataDefinitions={
            <p className="govuk-!-margin-top-0">See data source for details.</p>
          }
        />
      </Layout>
    </>
  );
};

export default LearningDisabilityPrevalence;
