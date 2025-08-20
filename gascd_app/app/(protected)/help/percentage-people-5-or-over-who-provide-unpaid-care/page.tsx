import Layout from '@/components/common/layout/Layout';

const UnpaidCare = () => {
  return (
    <>
      <Layout
        title="Indicator definition and supporting information: people aged 5 or over who provide unpaid care"
        backURL="/present-demand"
      >
        <div className="govuk-grid-row">
          <div className="govuk-grid-column-two-thirds">
            <h1 className="govuk-heading-l">
              Indicator definition and supporting information: people aged 5 or
              over who provide unpaid care
            </h1>
            <p className="govuk-body-l">
              Find detailed information about this indicator.
            </p>
            <dl className="govuk-summary-list">
              <div className="govuk-summary-list__row">
                <dt className="govuk-summary-list__key">What this measures</dt>
                <dd className="govuk-summary-list__value">
                  The proportion of people aged five years and over living
                  within the selected administrative area within England who
                  provide unpaid help or support to anyone who has long-term
                  physical or mental health conditions, illness or problems
                  related to old age. This does not include any activities as
                  part of paid employment. This help can be within or outside of
                  the carer&apos;s household.
                </dd>
              </div>

              <div className="govuk-summary-list__row">
                <dt className="govuk-summary-list__key">Source</dt>
                <dd className="govuk-summary-list__value">
                  <a
                    href="https://www.nomisweb.co.uk/datasets/c2021ts039"
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
                  usual residents aged 5 years and over in England and Wales by
                  the number of hours of unpaid care they provide. The estimates
                  are as at Census Day, 21 March 2021.
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

export default UnpaidCare;
