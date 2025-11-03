import React from 'react';

interface NavigationItem {
  link: string;
  heading: string;
}

interface DataCategoriesSidePanelProps {
  items: NavigationItem[];
}

const DataCategoriesSidePanel: React.FC<DataCategoriesSidePanelProps> = ({
  items,
}) => {
  return (
    <nav className="govuk-body" aria-label="Side navigation">
      <h2 className="govuk-heading-s">Contents</h2>
      <ul className="govuk-list govuk-list--bullet">
        {items.map((item, index) => (
          <li key={index}>
            <a
              href={item.link}
              className="govuk-link govuk-link--no-visited-state govuk-link--no-underline"
            >
              {item.heading}
            </a>
          </li>
        ))}
      </ul>
    </nav>
  );
};

export default DataCategoriesSidePanel;
