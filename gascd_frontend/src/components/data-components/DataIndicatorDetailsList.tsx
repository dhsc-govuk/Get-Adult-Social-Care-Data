import React from 'react';

type Props = {
  children?: React.ReactNode;
};

const DataIndicatorDetailsList: React.FC<Props> = ({ children }) => {
  return (
    <div className="govuk-grid-row">
      <div className="govuk-grid-column-two-thirds">
        <h2 className="govuk-heading-l govuk-!-margin-top-9">
          Data indicator details
        </h2>
        <p className="govuk-body">
          Use the links to view details on the data source, how the data was
          collected and any limitations to consider when using the data.
        </p>
        <ul className="govuk-list">{children}</ul>
      </div>
    </div>
  );
};

export default DataIndicatorDetailsList;
