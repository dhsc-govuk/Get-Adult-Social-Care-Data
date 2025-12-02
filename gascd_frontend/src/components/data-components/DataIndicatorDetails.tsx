'use client';

import React from 'react';

type Props = {
  title: string;
  whatThisMeasures: React.ReactNode;
  source: React.ReactNode;
  dataCorrectAsOf: React.ReactNode;
  updateFrequency: React.ReactNode;
  methodology: React.ReactNode;
  limitations: React.ReactNode;
  dataDefinitions: React.ReactNode;
};

const DataIndicatorDetails: React.FC<Props> = ({
  title,
  whatThisMeasures,
  source,
  dataCorrectAsOf,
  updateFrequency,
  methodology,
  limitations,
  dataDefinitions,
}) => {
  return (
    <>
      <div className="govuk-grid-row govuk-!-padding-top-8">
        <div className="govuk-grid-column-two-thirds">
          <span className="govuk-caption-l">Data indicator details</span>
          <h1 className="govuk-heading-l">{title}</h1>

          <dl className="govuk-summary-list">
            <div className="govuk-summary-list__row">
              <dt className="govuk-summary-list__key">What this measures</dt>
              <dd className="govuk-summary-list__value">{whatThisMeasures}</dd>
            </div>

            <div className="govuk-summary-list__row">
              <dt className="govuk-summary-list__key">Source</dt>
              <dd className="govuk-summary-list__value">{source}</dd>
            </div>

            <div className="govuk-summary-list__row">
              <dt className="govuk-summary-list__key">Data correct as of</dt>
              <dd className="govuk-summary-list__value">{dataCorrectAsOf}</dd>
            </div>

            <div className="govuk-summary-list__row">
              <dt className="govuk-summary-list__key">Update frequency</dt>
              <dd className="govuk-summary-list__value">{updateFrequency}</dd>
            </div>

            <div className="govuk-summary-list__row">
              <dt className="govuk-summary-list__key">Methodology</dt>
              <dd className="govuk-summary-list__value">{methodology}</dd>
            </div>

            <div className="govuk-summary-list__row">
              <dt className="govuk-summary-list__key">Limitations</dt>
              <dd className="govuk-summary-list__value">{limitations}</dd>
            </div>

            <div className="govuk-summary-list__row">
              <dt className="govuk-summary-list__key">Data definitions</dt>
              <dd className="govuk-summary-list__value">{dataDefinitions}</dd>
            </div>
          </dl>
        </div>
      </div>
    </>
  );
};

export default DataIndicatorDetails;
