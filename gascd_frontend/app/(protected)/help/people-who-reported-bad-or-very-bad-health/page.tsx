import Layout from '@/components/common/layout/Layout';
import DataIndicatorDetails from '@/components/data-components/DataIndicatorDetails';
import Link from 'next/link';

const BadHealth = () => {
  return (
    <>
      <Layout
        title="People who reported bad or very bad health"
        backURL="/topics/population-needs/disability-prevalence/data"
      >
        <DataIndicatorDetails
          title="People who reported bad or very bad health"
          whatThisMeasures={
            <p>
              The proportion of people living within the selected administrative
              area within England whose assessment of the general state of their
              health was bad or very bad. This assessment is not based on a
              person&apos;s health over any specified period of time.
            </p>
          }
          source={
            <Link
              href="https://www.nomisweb.co.uk/datasets/c2021ts037"
              className="govuk-link"
              target="_blank"
            >
              Office for National Statistics Census 2021 Disability dataset
              (opens in new tab)
            </Link>
          }
          updateFrequency="Census cadence"
          methodology={
            <p>
              This dataset provides Census 2021 estimates that classify usual
              residents in England and Wales by the state of their general
              health. The estimates are as at Census Day, 21 March 2021.
            </p>
          }
          limitations={<p>See data source for details.</p>}
          dataDefinitions={<p>See data source for details.</p>}
        />
      </Layout>
    </>
  );
};

export default BadHealth;
