'use client';
import Layout from '@/components/common/layout/Layout';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

const DisabilyPrevalence: React.FC = () => {
  const router = useRouter();
  return (
    <>
      <Layout
        title="Indicator definition: Disability prevalence"
        showLoginInformation={false}
        currentPage={'disabilty prevalence'}
        backURL="/present-demand"
      >
        <div className="govuk-grid-row">
          <div className="govuk-grid-column-two-thirds">
            <h1 className="govuk-heading-l">
              Indicator definition and supporting information: disability
              prevalence
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
                    The percentage of the population in England who are
                    considered disabled.
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
                      href="https://www.ons.gov.uk/datasets/TS038/editions/2021/versions/3"
                      className="govuk-link"
                      target="_blank"
                    >
                      Office for National Statistics Census 2021 Disability
                      dataset (opens in new tab)
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
                  <td className="govuk-table__cell">Every 10 years</td>
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
                    Disability status from self-reported data from the 2021
                    Census.
                  </td>
                </tr>

                <tr className="govuk-table__row">
                  <th scope="row" className="govuk-table__header">
                    Limitations
                  </th>
                  <td className="govuk-table__cell">
                    The data is based on survey responses, which may be subject
                    to response bias.
                    <br></br>
                    <br></br>
                    These are disability prevalence estimates for Census Day (21
                    March 2021), not the present day.
                  </td>
                </tr>

                <tr className="govuk-table__row">
                  <th scope="row" className="govuk-table__header">
                    Data definitions
                  </th>
                  <td className="govuk-table__cell">
                    &apos;People with disabilities&apos; refers to individuals
                    who report limitations in daily activities due to long-term
                    physical or mental illnesses.
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

export default DisabilyPrevalence;
