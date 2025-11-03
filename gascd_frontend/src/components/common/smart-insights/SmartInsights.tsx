import React from "react";

type Props = {
  body: string;
};

const SmartInsights: React.FC<Props> = ({ body }) => {
  return (
    <div className="govuk-grid-row govuk-!-margin-bottom-2">
      <div className="govuk-grid-column-full">
        <div className="dhsc-white-panel-container">
          <div className="govuk-grid-row">
            <div className="govuk-grid-column-full">
              <p className="govuk-body govuk-!-font-weight-bold govuk-!-margin-top-0 govuk-!-margin-bottom-1">
                Smart insights
              </p>
            </div>
          </div>
          <div className="govuk-grid-row govuk-!-margin-top-2">
            <div className="govuk-grid-column-full">
              <p className="govuk-body govuk-!-margin-bottom-0">{body}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SmartInsights;
