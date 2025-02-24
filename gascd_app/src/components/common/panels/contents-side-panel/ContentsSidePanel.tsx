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
    <nav className="moj-side-navigation" aria-label="Side navigation">
      <h3>Contents</h3>
      <ul className="moj-side-navigation__list">
        {items.map((item, index) => (
          <li key={index} className="moj-side-navigation__item">
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
