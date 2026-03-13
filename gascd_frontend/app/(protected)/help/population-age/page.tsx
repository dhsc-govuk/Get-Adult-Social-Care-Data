import Layout from '@/components/common/layout/Layout';
import DataIndicatorDetails from '@/components/data-components/DataIndicatorDetails';
import Link from 'next/link';

const PopulationAge: React.FC = () => {
  return (
    <>
      <Layout
        title="Age group percentages"
        showLoginInformation={false}
        currentPage={'population age'}
        backURL="/topics/population-needs/population-age-and-size/data"
      >
        <DataIndicatorDetails
          title="Age group percentages"
          whatThisMeasures={
            <p className="govuk-!-margin-top-0">
              The estimated percentage of individuals within the specified age
              group (for example, 18 to 64, 65 and over, or 85 and over) living
              in the selected administrative area within England.
            </p>
          }
          source={
            <Link
              href="https://www.ons.gov.uk/peoplepopulationandcommunity/populationandmigration/populationestimates/bulletins/populationestimatesforenglandandwales/mid2023"
              className="govuk-link"
              target="_blank"
            >
              Office for National Statistics population estimates for England
              and Wales (opens in new tab)
            </Link>
          }
          updateFrequency="Yearly"
          methodology={
            <>
              <p className="govuk-!-margin-top-0">
                This data is from the Office for National Statistics mid-2023
                population estimates for England and Wales.
              </p>
              <p className="govuk-!-margin-top-0">
                It includes individuals within the specified age group only.
              </p>
            </>
          }
          limitations={
            <>
              <p className="govuk-!-margin-top-0">
                The data are not counts, but estimates produced by combining
                data from multiple sources. The accuracy of the estimates is
                subject to the coverage and errors associated with those
                sources.
              </p>
              <p>
                These estimates reflect the mid-2023 population, not the current
                population.
              </p>
              <p>
                Changes to methods and data sources may lead to regular
                revisions of these estimates.
              </p>
            </>
          }
        />
      </Layout>
    </>
  );
};

export default PopulationAge;
