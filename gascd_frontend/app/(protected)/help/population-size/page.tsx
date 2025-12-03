'use client';
import Layout from '@/components/common/layout/Layout';
import DataIndicatorDetails from '@/components/data-components/DataIndicatorDetails';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

const PopulationSize: React.FC = () => {
  const router = useRouter();
  return (
    <>
      <Layout
        title="Population size"
        showLoginInformation={false}
        currentPage={'population size'}
        backURL="/topics/population-needs/population-age-and-size/data"
      >
        <DataIndicatorDetails
          title="Population size"
          whatThisMeasures={
            <p>
              The estimated number of individuals living in the selected
              administrative area within England.
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
          dataCorrectAsOf="3 December 2025"
          updateFrequency="Yearly"
          methodology={
            <p>
              This data is from the Office for National Statistics mid-2023
              population estimates for England and Wales.
            </p>
          }
          limitations={
            <>
              <p>
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
          dataDefinitions={<p>All ages are included in the population size.</p>}
        />
      </Layout>
    </>
  );
};

export default PopulationSize;
