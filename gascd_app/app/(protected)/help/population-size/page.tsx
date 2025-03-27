'use client';
import Layout from '@/components/common/layout/Layout';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

const PopulationSize: React.FC = () => {
  const router = useRouter();
  return (
    <>
      <Layout showLoginInformation={false} currentPage={'population size'}>
        <Link onClick={() => router.back()} className="govuk-back-link" href="">
          Back
        </Link>
        <div className="govuk-grid-row">
          <div className="govuk-grid-column-two-thirds">
            <h1 className="govuk-heading-l">
              Indicator definition and supporting information: population size
            </h1>

            <p className="govuk-body-l">
              Find detailed information about this indicator.
            </p>

            <table className="govuk-table">
              <thead className="govuk-table__head">
                <tr className="govuk-table__row">
                  <th
                    scope="row"
                    className="govuk-table__header govuk-!-width-one-third"
                  >
                    What this measures
                  </th>
                  <td className="govuk-table__cell">
                    The estimated number of individuals living in the selected
                    administrative area within England.
                  </td>
                </tr>
              </thead>
              <tbody className="govuk-table__body">
                <tr className="govuk-table__row">
                  <th scope="row" className="govuk-table__header">
                    Source
                  </th>
                  <td className="govuk-table__cell">
                    <Link
                      href="https://www.ons.gov.uk/peoplepopulationandcommunity/populationandmigration/populationestimates/bulletins/populationestimatesforenglandandwales/mid2023"
                      className="govuk-link"
                      target="_blank"
                    >
                      Office for National Statistics population estimates for
                      England and Wales (opens in new tab)
                    </Link>
                  </td>
                </tr>
                <tr className="govuk-table__row">
                  <th scope="row" className="govuk-table__header">
                    Data correct as of
                  </th>
                  <td className="govuk-table__cell">
                    [Generated automatically]
                  </td>
                </tr>
                <tr className="govuk-table__row">
                  <th scope="row" className="govuk-table__header">
                    Update frequency
                  </th>
                  <td className="govuk-table__cell">Yearly</td>
                </tr>

                <tr className="govuk-table__row">
                  <th scope="row" className="govuk-table__header">
                    Data available for
                  </th>
                  <td className="govuk-table__cell">
                    [Generated automatically, e.g. 5 February 2019 to 5 February
                    2025]
                  </td>
                </tr>

                <tr className="govuk-table__row">
                  <th scope="row" className="govuk-table__header">
                    Methodology
                  </th>
                  <td className="govuk-table__cell">
                    This data is from the Office for National Statistics
                    mid-2023 population estimates for England and Wales.
                  </td>
                </tr>

                <tr className="govuk-table__row">
                  <th scope="row" className="govuk-table__header">
                    Limitations
                  </th>
                  <td className="govuk-table__cell">
                    The data are not counts, but estimates produced by combining
                    data from multiple sources. The accuracy of the estimates is
                    subject to the coverage and errors associated with those
                    sources.
                    <br></br>
                    <br></br>
                    These estimates reflect the mid-2023 population, not the
                    current population.
                    <br></br>
                    <br></br>
                    Changes to methods and data sources may lead to regular
                    revisions of these estimates.
                  </td>
                </tr>

                <tr className="govuk-table__row">
                  <th scope="row" className="govuk-table__header">
                    Data definitions
                  </th>
                  <td className="govuk-table__cell">
                    All ages are included in the population size.
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </Layout>
    </>
  );
};

export default PopulationSize;
