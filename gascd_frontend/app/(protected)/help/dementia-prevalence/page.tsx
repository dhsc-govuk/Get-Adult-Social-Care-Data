import Layout from '@/components/common/layout/Layout';
import DataIndicatorDetails from '@/components/data-components/DataIndicatorDetails';
import Link from 'next/link';

const DementiaPrevalence = () => {
  return (
    <>
      <Layout
        title="Dementia prevalence"
        backURL="/topics/population-needs/dementia-prevalence/data"
      >
        <DataIndicatorDetails
          title="Dementia prevalence"
          whatThisMeasures={
            <p>
              The percentage of people registered with a GP within the selected
              administrative area within England who have a recorded diagnosis
              of dementia.
            </p>
          }
          source={
            <Link
              href="https://fingertips.phe.org.uk/dementia#page/6/gid/1938132811/pat/159/par/K02000001/ati/15/are/E92000001/iid/247/age/1/sex/4/cat/-1/ctp/-1/yrr/1/cid/4/tbm/1/page-options/car-do-0"
              className="govuk-link"
              target="_blank"
            >
              Fingertips from the Department of Health and Social Care (opens in
              new tab)
            </Link>
          }
          dataCorrectAsOf="3 December 2025"
          updateFrequency="Yearly"
          methodology={
            <p>
              Based on Quality and Outcomes Framework (QOF) data, this measure
              calculates the proportion of patients on GP practice registers
              with a recorded diagnosis of dementia. Figures are aggregated to
              local authority level using the postcode of the GP practice, not
              the patient&apos;s home address.
            </p>
          }
          limitations={
            <p>
              The measure is intended to show the prevalence of dementia among
              residents of each local authority area. However, data by place of
              residence is not available. Instead, a proxy is used based on GP
              registrations, assigning individuals to a local authority
              according to the postcode of their GP practice rather than their
              home address.
            </p>
          }
          dataDefinitions={<p>See data source for details.</p>}
        />
      </Layout>
    </>
  );
};

export default DementiaPrevalence;
