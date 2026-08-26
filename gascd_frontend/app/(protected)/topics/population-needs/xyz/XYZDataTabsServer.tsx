import React from 'react';

type XYZDataTabItem = {
  label: string;
  id: string;
  panel: React.ReactNode;
};

type Props = {
  items: XYZDataTabItem[];
  source?: string;
};
export default async function XYZDataTabsServer({ items, source }: Props) {
  return (
    <div className="govuk-tabs" data-module="govuk-tabs">
      <h2 className="govuk-tabs__title">Contents</h2>
      <ul className="govuk-tabs__list">
        {items.map((item, idx) => (
          <li
            className={`${idx == 0 ? 'govuk-tabs__list-item govuk-tabs__list-item--selected' : 'govuk-tabs__list-item '}`}
            key={item.id}
          >
            <a className="govuk-tabs__tab" href={`#${item.id}`}>
              {item.label}
            </a>
          </li>
        ))}
      </ul>
      {items.map((item, idx) => (
        <div
          className={`${idx == 0 ? 'govuk-tabs__panel' : 'govuk-tabs__panel govuk-tabs__panel--hidden'}`}
          id={item.id}
          key={item.id}
        >
          {/* <h2 className="govuk-heading-l">{item.label}</h2> */}
          {item.panel}

          {source && <p className="govuk-body">Source: {source}</p>}
        </div>
      ))}
    </div>
  );
}
