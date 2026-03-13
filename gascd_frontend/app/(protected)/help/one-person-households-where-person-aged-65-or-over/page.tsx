import Layout from '@/components/common/layout/Layout';
import DataIndicatorDetails from '@/components/data-components/DataIndicatorDetails';
import Link from 'next/link';

const OnePersonHouseholds = () => {
  return (
    <>
      <Layout
        title="One-person households where the person is aged 65 or over"
        backURL="/topics/population-needs/household-composition-and-economic-factors/data"
      >
        <DataIndicatorDetails
          title="One-person households where the person is aged 65 or over"
          whatThisMeasures={
            <p className="govuk-!-margin-top-0">
              The proportion of all one-person households within the selected
              administrative area within England that consist of a single person
              aged 65 or older.
            </p>
          }
          source={
            <Link
              href="https://www.nomisweb.co.uk/datasets/c2021ts003"
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
              This dataset provides Census 2021 estimates that classify
              households in England and Wales by the relationships between
              household members (household composition). The estimates are as at
              Census Day, 21 March 2021.
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

export default OnePersonHouseholds;
