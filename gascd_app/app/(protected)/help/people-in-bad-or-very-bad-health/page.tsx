import Layout from '@/components/common/layout/Layout';

const BadHealth = () => {
  return (
    <>
      <Layout
        title="Indicator definition and supporting information: people in bad or very bad health"
        backURL="/present-demand"
      >
        <div className="govuk-grid-row">
          <div className="govuk-grid-column-two-thirds">
            <h1 className="govuk-heading-l">
              Indicator definition and supporting information: people in bad or
              very bad health
            </h1>
            <p className="govuk-body-l">
              Find detailed information about this indicator.
            </p>
            <dl className="govuk-summary-list">
              <div className="govuk-summary-list__row">
                <dt className="govuk-summary-list__key">What this measures</dt>
                <dd className="govuk-summary-list__value">
                  The proportion of people living within the selected
                  administrative area within England whose assessment of the
                  general state of their health was bad or very bad. This
                  assessment is not based on a person&apos;s health over any
                  specified period of time.
                </dd>
              </div>

              <div className="govuk-summary-list__row">
                <dt className="govuk-summary-list__key">Source</dt>
                <dd className="govuk-summary-list__value">
                  <a
                    href="https://www.nomisweb.co.uk/datasets/c2021ts037"
                    className="govuk-link"
                    target="_blank"
                    rel="noreferrer noopener"
                  >
                    Census 2021 from the Office for National Statistics (opens
                    in new tab)
                  </a>
                </dd>
              </div>

              <div className="govuk-summary-list__row">
                <dt className="govuk-summary-list__key">Data correct as of</dt>
                <dd className="govuk-summary-list__value"></dd>
              </div>

              <div className="govuk-summary-list__row">
                <dt className="govuk-summary-list__key">Update frequency</dt>
                <dd className="govuk-summary-list__value">Yearly</dd>
              </div>

              <div className="govuk-summary-list__row">
                <dt className="govuk-summary-list__key">Methodology</dt>
                <dd className="govuk-summary-list__value">
                  This dataset provides Census 2021 estimates that classify
                  usual residents in England and Wales by the state of their
                  general health. The estimates are as at Census Day, 21 March
                  2021.
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

export default BadHealth;
