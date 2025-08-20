import Layout from '@/components/common/layout/Layout';

const OnePersonHouseholds = () => {
  return (
    <>
      <Layout
        title="Indicator definition and supporting information: one-person households where the person is aged 65 or over"
        backURL="/present-demand"
      >
        <div className="govuk-grid-row">
          <div className="govuk-grid-column-two-thirds">
            <h1 className="govuk-heading-l">
              Indicator definition and supporting information: one-person
              households where the person is aged 65 or over
            </h1>
            <p className="govuk-body-l">
              Find detailed information about this indicator.
            </p>
            <dl className="govuk-summary-list">
              <div className="govuk-summary-list__row">
                <dt className="govuk-summary-list__key">What this measures</dt>
                <dd className="govuk-summary-list__value">
                  The proportion of all one-person households within the
                  selected administrative area within England that consist of a
                  single person aged 65 or older.
                </dd>
              </div>

              <div className="govuk-summary-list__row">
                <dt className="govuk-summary-list__key">Source</dt>
                <dd className="govuk-summary-list__value">
                  <a
                    href="https://www.nomisweb.co.uk/datasets/c2021ts003"
                    className="govuk-link"
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    Census 2021 from the Office for National Statistics (opens
                    in new tab)
                  </a>
                </dd>
              </div>

              <div className="govuk-summary-list__row">
                <dt className="govuk-summary-list__key">Data correct as of</dt>
                <dd className="govuk-summary-list__value">14 August 2025</dd>
              </div>

              <div className="govuk-summary-list__row">
                <dt className="govuk-summary-list__key">Update frequency</dt>
                <dd className="govuk-summary-list__value">Census cadence</dd>
              </div>
              <div className="govuk-summary-list__row">
                <dt className="govuk-summary-list__key">Methodology</dt>
                <dd className="govuk-summary-list__value">
                  This dataset provides Census 2021 estimates that classify
                  households in England and Wales by the relationships between
                  household members (household composition). The estimates are
                  as at Census Day, 21 March 2021.
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

export default OnePersonHouseholds;
