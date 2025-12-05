import Layout from '@/components/common/layout/Layout';
import DataIndicatorDetails from '@/components/data-components/DataIndicatorDetails';
import Link from 'next/link';

const HouseholdsPropertyOwned = () => {
  return (
    <>
      <Layout
        title="Households where the property is owned outright"
        backURL="/topics/population-needs/household-composition-and-economic-factors/data"
      >
        <DataIndicatorDetails
          title="Households where the property is owned outright"
          whatThisMeasures={
            <p>
              The proportion of households within the selected administrative
              area within England that own their home outright, without a
              mortgage or loan. This includes properties owned entirely by at
              least one household member.
            </p>
          }
          source={
            <Link
              href="https://www.nomisweb.co.uk/datasets/c2021ts054"
              className="govuk-link"
              target="_blank"
            >
              Census 2021 from the Office for National Statistics (opens in new
              tab)
            </Link>
          }
          updateFrequency="Census cadence"
          methodology={
            <p>
              This dataset provides Census 2021 estimates that classify
              households in England and Wales by tenure. The estimates are as at
              Census Day, 21 March 2021.
            </p>
          }
          limitations={<p>See data source for details.</p>}
          dataDefinitions={<p>See data source for details.</p>}
        />
      </Layout>
    </>
  );
};

export default HouseholdsPropertyOwned;
