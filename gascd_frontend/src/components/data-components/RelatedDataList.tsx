import React from 'react';

type Props = {
  children?: React.ReactNode;
};

const RelatedDataList: React.FC<Props> = ({ children }) => {
  return (
    <div className="govuk-grid-row">
      <div className="gem-c-cards govuk-grid-column-full">
        <h2 className="govuk-heading-l govuk-!-margin-top-9">Related data</h2>
        <ul className="gem-c-cards__list gem-c-cards__list--one-column">
          {children}
        </ul>
      </div>
    </div>
  );
};

export default RelatedDataList;
