import Layout from '@/components/common/layout/Layout';
import DataIndicatorDetails from '@/components/data-components/DataIndicatorDetails';
import Link from 'next/link';

const DementiaDiagnosis = () => {
  return (
    <>
      <Layout
        title="Estimated dementia diagnosis rate for people aged 65 and over"
        backURL="/topics/population-needs/dementia-prevalence/data"
      >
        <DataIndicatorDetails
          title="Estimated dementia diagnosis rate for people aged 65 and over"
          whatThisMeasures={
            <p>
              The proportion of people living within the selected administrative
              area within England aged 65 and over who are estimated to have
              dementia and have received a formal diagnosis recorded in their GP
              records.
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
          dataCorrectAsOf={'[Add Data]'}
          updateFrequency="Yearly"
          methodology={
            <p>
              The estimated dementia diagnosis rate is calculated by comparing
              the number of people aged 65 and older with a recorded dementia
              diagnosis on GP registers to the estimated number of people in
              that age group who are likely to have dementia, based on national
              prevalence rates. The estimates use population data and standard
              prevalence models to provide an expected number of cases.
            </p>
          }
          limitations={
            <p>
              Organisations with a smaller denominator population than the
              reference population used for calculating estimated rates should
              be interpreted with caution. This is true for City of London and
              Isles of Scilly. All counts are greater than 300, except for City
              of London and Isles of Scilly. Both of these have indicator values
              close to 50 percent so the normal approximation is still
              sufficiently accurate.
            </p>
          }
        />
      </Layout>
    </>
  );
};

export default DementiaDiagnosis;
