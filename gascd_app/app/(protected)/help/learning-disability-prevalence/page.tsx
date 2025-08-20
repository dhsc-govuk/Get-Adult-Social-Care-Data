import Layout from '@/components/common/layout/Layout';

const LearningDisabilityPrevalence = () => {
  return (
    <>
      <Layout
        title="Indicator definition and supporting information: learning disability prevalence"
        backURL="/present-demand"
      >
        <div className="govuk-grid-row">
          <div className="govuk-grid-column-two-thirds">
            <h1 className="govuk-heading-l">
              Indicator definition and supporting information: learning
              disability prevalence
            </h1>
            <p className="govuk-body-l">
              Find detailed information about this indicator.
            </p>
            <dl className="govuk-summary-list">
              <div className="govuk-summary-list__row">
                <dt className="govuk-summary-list__key">What this measures</dt>
                <dd className="govuk-summary-list__value">
                  The percentage of people registered with a GP within the
                  selected administrative area within England who have a
                  recorded diagnosis of learning disability, covering all ages.
                </dd>
              </div>

              <div className="govuk-summary-list__row">
                <dt className="govuk-summary-list__key">Source</dt>
                <dd className="govuk-summary-list__value">
                  <a
                    href="https://fingertips.phe.org.uk/search/learning#page/4/gid/1/pat/159/par/K02000001/ati/15/are/E92000001/iid/200/age/1/sex/4/cat/-1/ctp/-1/yrr/1/cid/4/tbm/1"
                    className="govuk-link"
                    target="_blank"
                    rel="noreferrer noopener"
                  >
                    Fingertips from the Department of Health and Social Care
                    (opens in new tab)
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
                  Based on Quality and Outcomes Framework (QOF) data, this
                  measure calculates the proportion of patients recorded on GP
                  practice registers as having a learning disability. The data
                  is aggregated to local authority level using the postcode of
                  the GP practice, rather than the patient’s place of residence.
                </dd>
              </div>

              <div className="govuk-summary-list__row">
                <dt className="govuk-summary-list__key">Limitations</dt>
                <dd className="govuk-summary-list__value">
                  The measure is intended to show the prevalence of learning
                  disabilities among residents of each local authority area.
                  However, data by place of residence is not available. Instead,
                  a proxy is used based on GP registrations, assigning
                  individuals to a local authority according to the postcode of
                  their GP practice rather than their home address.
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

export default LearningDisabilityPrevalence;
