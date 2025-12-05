import React from 'react';

type Props = {
  dataTitle: string;
  dataInfo: React.ReactNode;
  children?: React.ReactNode;
};

const DataBox: React.FC<Props> = ({ dataTitle, dataInfo, children }) => {
  return (
    <div
      className="govuk-grid-row govuk-!-padding-4 govuk-!-margin-bottom-6"
      style={{ backgroundColor: ' #f3f2f1' }}
    >
      <div className="govuk-grid-column-full govuk-!-padding-0">
        <div className="data-box govuk-form-group govuk-!-margin-0">
          <div
            className="govuk-tabs govuk-!-margin-bottom-0"
            data-module="govuk-tabs"
          >
            <h3 className="govuk-heading-m">{dataTitle}</h3>
            {dataInfo}
            {children}
          </div>
        </div>
      </div>
    </div>
  );
};

export default DataBox;
