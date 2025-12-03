import Layout from '@/components/common/layout/Layout';
import DataIndicatorDetails from '@/components/data-components/DataIndicatorDetails';
import Link from 'next/link';

const HouseholdsDeprived = () => {
  return (
    <>
      <Layout
        title="Households deprived in 4 dimensions"
        backURL="/topics/population-needs/household-composition-and-economic-factors/data"
      >
        <DataIndicatorDetails
          title="Households deprived in 4 dimensions"
          whatThisMeasures={
            <p>
              The percentage of households deprived in all four Census-defined
              dimensions: employment (no one in the household in work),
              education (no household member with qualifications and no one aged
              16 to 18 in full-time education), health and disability (any
              member reporting bad health or long-term illness), and housing
              (overcrowding, shared facilities or lack of central heating)
              within the selected administrative area within England.
            </p>
          }
          source={
            <Link
              href="https://www.nomisweb.co.uk/datasets/c2021ts011"
              className="govuk-link"
              target="_blank"
            >
              Census 2021 from the Office for National Statistics (opens in new
              tab)
            </Link>
          }
          dataCorrectAsOf="21 March 2021"
          updateFrequency="Census cadence"
          methodology={
            <p>
              This dataset provides Census 2021 estimates that classify
              households in England and Wales by four dimensions of deprivation:
              employment, education, health and disability, and household
              overcrowding. The estimates are as at Census Day, 21 March 2021.
            </p>
          }
          limitations={<p>See data source for details.</p>}
          dataDefinitions={<p>See data source for details.</p>}
        />
      </Layout>
    </>
  );
};

export default HouseholdsDeprived;
