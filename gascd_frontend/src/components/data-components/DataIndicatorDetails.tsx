'use client';

import React from 'react';
import { usePathname } from 'next/navigation';
import { getSharingForHelpPage } from '@/data/sharingCategories';

type Props = {
  title: string;
  whatThisMeasures: React.ReactNode;
  source: React.ReactNode;
  updateFrequency: React.ReactNode;
  methodology: React.ReactNode;
  limitations: React.ReactNode;
  dataDefinitions?: React.ReactNode;
};

const DataIndicatorDetails: React.FC<Props> = ({
  title,
  whatThisMeasures,
  source,
  updateFrequency,
  methodology,
  limitations,
  dataDefinitions = null,
}) => {
  // Resolved from the page's own route against the agreed list in
  // HELP_PAGE_SHARING, so every details page is categorised in one place
  const sharingForPage = getSharingForHelpPage(usePathname());
  const sharing = sharingForPage?.category;
  const sharingReasoning = sharingForPage?.reasoning;

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
              <dt className="govuk-summary-list__key">Update frequency</dt>
              <dd className="govuk-summary-list__value">{updateFrequency}</dd>
            </div>

            {sharing && (
              <div
                className="govuk-summary-list__row"
                data-testid="sharing-rules-row"
              >
                <dt className="govuk-summary-list__key">Sharing rules</dt>
                <dd className="govuk-summary-list__value">
                  <p className="govuk-!-margin-top-0">
                    <strong className={`govuk-tag ${sharing.tagModifier}`}>
                      {sharing.label}
                    </strong>
                  </p>
                  <p>{sharing.statement}</p>
                  {sharingReasoning && <p>{sharingReasoning}</p>}
                  {sharing.additionalSourceNote && (
                    <p className="govuk-!-margin-bottom-0">
                      {sharing.additionalSourceNote}
                    </p>
                  )}
                </dd>
              </div>
            )}

            <div className="govuk-summary-list__row">
              <dt className="govuk-summary-list__key">Methodology</dt>
              <dd className="govuk-summary-list__value">{methodology}</dd>
            </div>

            <div className="govuk-summary-list__row">
              <dt className="govuk-summary-list__key">Limitations</dt>
              <dd className="govuk-summary-list__value">{limitations}</dd>
            </div>

            {dataDefinitions && (
              <div className="govuk-summary-list__row">
                <dt className="govuk-summary-list__key">Data definitions</dt>
                <dd className="govuk-summary-list__value">{dataDefinitions}</dd>
              </div>
            )}
          </dl>
        </div>
      </div>
    </>
  );
};

export default DataIndicatorDetails;
