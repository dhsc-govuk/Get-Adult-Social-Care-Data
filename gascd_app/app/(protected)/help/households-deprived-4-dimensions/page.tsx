import Layout from '@/components/common/layout/Layout';

const HouseholdsDeprived = () => {
  return (
    <>
      <Layout
        title="Indicator definition and supporting information: households 'deprived in 4 dimensions'"
        backURL="/present-demand"
      >
        <div className="govuk-grid-row">
          <div className="govuk-grid-column-two-thirds">
            <h1 className="govuk-heading-l">
              Indicator definition and supporting information: households
              &apos;deprived in 4 dimensions&apos;
            </h1>
            <p className="govuk-body-l">
              Find detailed information about this indicator.
            </p>
            <dl className="govuk-summary-list">
              <div className="govuk-summary-list__row">
                <dt className="govuk-summary-list__key">What this measures</dt>
                <dd className="govuk-summary-list__value">
                  The percentage of households deprived in all four
                  Census-defined dimensions: employment (no one in the household
                  in work), education (no household member with qualifications
                  and no one aged 16 to 18 in full-time education), health and
                  disability (any member reporting bad health or long-term
                  illness), and housing (overcrowding, shared facilities or lack
                  of central heating) within the selected administrative area
                  within England.
                </dd>
              </div>

              <div className="govuk-summary-list__row">
                <dt className="govuk-summary-list__key">Source</dt>
                <dd className="govuk-summary-list__value">
                  <a
                    href="https://www.nomisweb.co.uk/datasets/c2021ts011"
                    className="govuk-link"
                    target="_blank"
                    rel="noreferrer"
                  >
                    Census 2021 from the Office for National Statistics (opens
                    in new tab)
                  </a>
                </dd>
              </div>

              <div className="govuk-summary-list__row">
                <dt className="govuk-summary-list__key">Data correct as of</dt>
                <dd className="govuk-summary-list__value">21 March 2021</dd>
              </div>

              <div className="govuk-summary-list__row">
                <dt className="govuk-summary-list__key">Update frequency</dt>
                <dd className="govuk-summary-list__value">Census cadence</dd>
              </div>
              <div className="govuk-summary-list__row">
                <dt className="govuk-summary-list__key">Methodology</dt>
                <dd className="govuk-summary-list__value">
                  This dataset provides Census 2021 estimates that classify
                  households in England and Wales by four dimensions of
                  deprivation: employment, education, health and disability, and
                  household overcrowding. The estimates are as at Census Day, 21
                  March 2021.
                </dd>
              </div>

              <div className="govuk-summary-list__row">
                <dt className="govuk-summary-list__key">Limitations</dt>
                <dd className="govuk-summary-list__value">
                  See data source for details.
                </dd>
              </div>

              <div className="govuk-summary-list__row">
                <dt className="govuk-summary-list__key">Data definitions</dt>
                <dd className="govuk-summary-list__value">
                  See data source for details.
                </dd>
              </div>
            </dl>
          </div>
        </div>
      </Layout>
    </>
  );
};

export default HouseholdsDeprived;
