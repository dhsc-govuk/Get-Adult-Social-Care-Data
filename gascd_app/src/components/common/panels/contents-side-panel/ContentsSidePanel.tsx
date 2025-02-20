import React from "react";

const DataCategoriesSidePanel: React.FC = () => {
  const dataCategories: Array<string> = [
    "Indicator definition and supporting information",
    "Chart",
    "Table"
  ];
  return (
    <div className="dhsc-blue-panel-container">
      <h4 className="govuk-heading-m govuk-!-margin-bottom-5 dhsc-!-text-white">Contents</h4>
      <ul className="govuk-list govuk-!-margin-left-3">
        {dataCategories.map((contents, index) => (
          <li key={index} className="govuk-!-margin-bottom-3 dhsc-!-text-white">
            <a
              className="govuk-link govuk-link--no-visited-state govuk-link--no-underline"
              href="#"
            >
              {contents}
            </a>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default DataCategoriesSidePanel;
