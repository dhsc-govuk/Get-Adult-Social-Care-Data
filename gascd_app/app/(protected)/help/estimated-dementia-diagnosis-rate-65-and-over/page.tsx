import Layout from '@/components/common/layout/Layout';

const DementiaDiagnosis = () => {
  return (
    <>
      <Layout
        title="Indicator definition and supporting information: estimated dementia diagnosis rate"
        backURL="/present-demand"
      >
        <div className="govuk-grid-row">
          <div className="govuk-grid-column-two-thirds">
            <h1 className="govuk-heading-l">
              Indicator definition and supporting information: estimated
              dementia diagnosis rate
            </h1>
            <p className="govuk-body-l">
              Find detailed information about this indicator.
            </p>
            <dl className="govuk-summary-list">
              <div className="govuk-summary-list__row">
                <dt className="govuk-summary-list__key">What this measures</dt>
                <dd className="govuk-summary-list__value">
                  The proportion of people living within the selected
                  administrative area within England aged 65 and over who are
                  estimated to have dementia and have received a formal
                  diagnosis recorded in their GP records.
                </dd>
              </div>

              <div className="govuk-summary-list__row">
                <dt className="govuk-summary-list__key">Source</dt>
                <dd className="govuk-summary-list__value">
                  <a
                    href="https://fingertips.phe.org.uk/dementia#page/6/gid/1938132811/pat/159/par/K02000001/ati/15/are/E92000001/iid/92949/age/27/sex/4/cat/-1/ctp/-1/yrr/1/cid/4/tbm/1"
                    className="govuk-link"
                    target="_blank"
                    rel="noreferrer"
                  >
                    Fingertips from the Department of Health and Social Care
                    (opens in new tab)
                  </a>
                </dd>
              </div>

              <div className="govuk-summary-list__row">
                <dt className="govuk-summary-list__key">Data correct as of</dt>
                <dd className="govuk-summary-list__value">05 August 2025</dd>
              </div>

              <div className="govuk-summary-list__row">
                <dt className="govuk-summary-list__key">Update frequency</dt>
                <dd className="govuk-summary-list__value">Yearly</dd>
              </div>
              <div className="govuk-summary-list__row">
                <dt className="govuk-summary-list__key">Methodology</dt>
                <dd className="govuk-summary-list__value">
                  The estimated dementia diagnosis rate is calculated by
                  comparing the number of people aged 65 and older with a
                  recorded dementia diagnosis on GP registers to the estimated
                  number of people in that age group who are likely to have
                  dementia, based on national prevalence rates. The estimates
                  use population data and standard prevalence models to provide
                  an expected number of cases.
                </dd>
              </div>

              <div className="govuk-summary-list__row">
                <dt className="govuk-summary-list__key">Limitations</dt>
                <dd className="govuk-summary-list__value">
                  Organisations with a smaller denominator population than the
                  reference population used for calculating estimated rates
                  should be interpreted with caution. This is true for City of
                  London and Isles of Scilly. All counts are greater than 300,
                  except for City of London and Isles of Scilly. Both of these
                  have indicator values close to 50 percent so the normal
                  approximation is still sufficiently accurate.
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

export default DementiaDiagnosis;
