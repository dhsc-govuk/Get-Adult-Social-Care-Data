import React from 'react';

type Props = {
  label: string;
  sources: String;
  updateFrequency: string;
  limitations: boolean;
  url: string;
};

const DataIndicatorDetail: React.FC<Props> = ({
  label,
  sources,
  updateFrequency,
  limitations,
  url,
}) => {
  return (
    <>
      <li className="govuk-grid-row">
        <div className="govuk-grid-column-two-thirds govuk-!-margin-top-4">
          <h2 className="govuk-heading-s">
            <a className="govuk-link" href={url}>
              {label}
            </a>
          </h2>
          <p className="govuk-body govuk-!-margin-bottom-0">
            Sources: {sources}.
          </p>
          <p className="govuk-body">
            {updateFrequency} updates{limitations && ', limitations apply'}.
          </p>
        </div>
        <div className="govuk-grid-column-one-third govuk-align-right govuk-!-margin-top-4">
          doop
        </div>
      </li>
      <hr className="govuk-section-break govuk-section-break--visible" />
    </>
  );
};

export default DataIndicatorDetail;
