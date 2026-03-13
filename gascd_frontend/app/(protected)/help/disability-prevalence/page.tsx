import Layout from '@/components/common/layout/Layout';
import DataIndicatorDetails from '@/components/data-components/DataIndicatorDetails';
import Link from 'next/link';

const DisabilyPrevalence: React.FC = () => {
  return (
    <>
      <Layout
        title="Disability prevalence"
        showLoginInformation={false}
        currentPage={'disabilty prevalence'}
        backURL="/topics/population-needs/disability-prevalence/data"
      >
        <DataIndicatorDetails
          title="Disability prevalence"
          whatThisMeasures={
            <p className="govuk-!-margin-top-0">
              The proportion of people living within the selected administrative
              area within England who assessed their day-to-day activities as
              limited by long-term physical or mental health conditions or
              illnesses are considered disabled. This definition of a disabled
              person meets the harmonised standard for measuring disability and
              is in line with the Equality Act (2010).
            </p>
          }
          source={
            <Link
              href="https://www.nomisweb.co.uk/datasets/c2021ts038"
              className="govuk-link"
              target="_blank"
            >
              Census 2021 from the Office for National Statistics (opens in new
              tab)
            </Link>
          }
          updateFrequency="Census cadence"
          methodology={
            <p className="govuk-!-margin-top-0">
              This dataset provides Census 2021 estimates that classify usual
              residents in England and Wales by long-term health problems or
              disabilities. The estimates are as at Census Day, 21 March 2021.
            </p>
          }
          limitations={
            <p className="govuk-!-margin-top-0">See data source for details.</p>
          }
        />
      </Layout>
    </>
  );
};

export default DisabilyPrevalence;
