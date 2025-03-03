import Layout from '@/components/common/layout/Layout';

const PopulationAge: React.FC = () => {
  return (
    <Layout showLoginInformation={false} currentPage={''}>
      <div className="govuk-grid-row">
        <div className="govuk-grid-column-two-thirds">
          <h1 className="govuk-heading-l">
            Indicator definition and supporting information: percentage of
            population aged 18 to 64, or 65 and over
          </h1>

          <p className="govuk-body-l">
            Find detailed information about this indicator group.
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
                  The estimated percentage of individuals within the specified
                  age group living in the selected administrative area within
                  England.
                </td>
              </tr>
            </thead>
            <tbody className="govuk-table__body">
              <tr className="govuk-table__row">
                <th scope="row" className="govuk-table__header">
                  Source
                </th>
                <td className="govuk-table__cell">
                  <a
                    href="https://www.ons.gov.uk/peoplepopulationandcommunity/populationandmigration/populationestimates/bulletins/populationestimatesforenglandandwales/mid2023"
                    className="govuk-link"
                    rel="noopener"
                  >
                    Office for National Statistics population estimates for
                    England and Wales (opens in new tab)
                  </a>
                </td>
              </tr>
              <tr className="govuk-table__row">
                <th scope="row" className="govuk-table__header">
                  Data correct as of
                </th>
                <td className="govuk-table__cell">[Generated automatically]</td>
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
                  This data is from the Office for National Statistics mid-2023
                  population estimates for England and Wales.
                </td>
              </tr>

              <tr className="govuk-table__row">
                <th scope="row" className="govuk-table__header">
                  Limitations
                </th>
                <td className="govuk-table__cell">
                  <p className="govuk-body">
                    The data are not counts, but estimates produced by combining
                    data from multiple sources. The accuracy of the estimates is
                    subject to the coverage and errors associated with those
                    sources.
                  </p>

                  <p className="govuk-body">
                    These estimates reflect the mid-2023 population, not the
                    current population.
                  </p>

                  <p className="govuk-body">
                    Changes to methods and data sources may lead to regular
                    revisions of these estimates.
                  </p>
                </td>
              </tr>

              <tr className="govuk-table__row">
                <th scope="row" className="govuk-table__header">
                  Data definitions
                </th>
                <td className="govuk-table__cell">
                  Refers to individuals within the specified age group only.
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </Layout>
  );
};

export default PopulationAge;
