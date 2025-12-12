import React from 'react';

type Props = {
  dataTitle: string;
  dataInfo: React.ReactNode;
  children?: React.ReactNode;
};

const DataBox: React.FC<Props> = ({ dataTitle, dataInfo, children }) => {
  return (
    <div className="govuk-grid-row">
      <div className="govuk-grid-column-full">
        <div className="data-box govuk-form-group">
          <div className="govuk-tabs" data-module="govuk-tabs">
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
