import React from 'react';

type XYZDataTabItem = {
  label: string;
  id: string;
  panel: React.ReactNode;
};
type Props = {
  // id: string;
  // chart?: React.ReactNode;
  // graph?: React.ReactNode;
  // table?: React.ReactNode;
  // textSummary?: React.ReactNode;
  // map?: React.ReactNode;
  // download?: React.ReactNode;
  items: XYZDataTabItem[];
  source?: string;
};
export default async function XYZDataTabsServer({
  // id,
  // chart,
  // graph,
  // table,
  // map,
  // download,
  // textSummary,
  items,
  source,
}: Props) {
  return (
    // return items.map((item) => <p key={item.id}>Item - {item.id}</p>);

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

  // <div className="govuk-tabs" data-module="govuk-tabs">
  //   <h3 className="govuk-tabs__title">Contents</h3>
  //   <ul className="govuk-tabs__list">
  //     {map && (
  //       <li
  //         className={`govuk-tabs__list-item${map ? ' govuk-tabs__list-item--selected' : ''}`}
  //       >
  //         <a
  //           className="govuk-tabs__tab"
  //           href={`#map-${id}`}
  //           onClick={() => {
  //             // tabClicked('map');
  //           }}
  //         >
  //           Map
  //         </a>
  //       </li>
  //     )}
  //     {chart && (
  //       <li
  //         className={`govuk-tabs__list-item${!map && chart ? ' govuk-tabs__list-item--selected' : ''}`}
  //       >
  //         <a
  //           className="govuk-tabs__tab"
  //           href={`#chart-${id}`}
  //           onClick={() => {
  //             // tabClicked('chart');
  //           }}
  //         >
  //           Chart
  //         </a>
  //       </li>
  //     )}
  //     {graph && (
  //       <li
  //         className={`govuk-tabs__list-item${!map && !chart && graph ? ' govuk-tabs__list-item--selected' : ''}`}
  //       >
  //         <a
  //           className="govuk-tabs__tab"
  //           href={`#graph-${id}`}
  //           onClick={() => {
  //             // tabClicked('graph');
  //           }}
  //         >
  //           Graph
  //         </a>
  //       </li>
  //     )}
  //     {table && (
  //       <li
  //         className={`govuk-tabs__list-item${!map && !chart && !graph && table ? ' govuk-tabs__list-item--selected' : ''}`}
  //       >
  //         <a
  //           className="govuk-tabs__tab"
  //           href={`#table-${id}`}
  //           onClick={() => {
  //             // tabClicked('table');
  //           }}
  //         >
  //           Table
  //         </a>
  //       </li>
  //     )}
  //     {textSummary && (
  //       <li
  //         className={`govuk-tabs__list-item${!map && !chart && !table && textSummary ? ' govuk-tabs__list-item--selected' : ''}`}
  //       >
  //         <a
  //           className="govuk-tabs__tab"
  //           href={`#textSummary-${id}`}
  //           onClick={() => {
  //             // tabClicked('text-summary');
  //           }}
  //         >
  //           Text Summary
  //         </a>
  //       </li>
  //     )}
  //     {download && (
  //       <li
  //         className={`govuk-tabs__list-item${!map && !chart && !table && !textSummary && download ? ' govuk-tabs__list-item--selected' : ''}`}
  //       >
  //         <a
  //           className="govuk-tabs__tab"
  //           href={`#download-${id}`}
  //           onClick={() => {
  //             // tabClicked('download');
  //           }}
  //         >
  //           Download
  //         </a>
  //       </li>
  //     )}
  //   </ul>
  //   {map && (
  //     <div
  //       className="govuk-tabs__panel"
  //       id={`map-${id}`}
  //       style={{ backgroundColor: 'white' }}
  //     >
  //       {map}
  //     </div>
  //   )}
  //   {chart && (
  //     <div
  //       className="govuk-tabs__panel"
  //       id={`chart-${id}`}
  //       style={{ backgroundColor: 'white' }}
  //     >
  //       {chart}
  //     </div>
  //   )}
  //   {graph && (
  //     <div
  //       className="govuk-tabs__panel"
  //       id={`graph-${id}`}
  //       style={{ backgroundColor: 'white' }}
  //     >
  //       {graph}
  //     </div>
  //   )}{' '}
  //   {table && (
  //     <div
  //       className="govuk-tabs__panel govuk-tabs__panel--hidden"
  //       id={`table-${id}`}
  //       style={{ backgroundColor: 'white' }}
  //     >
  //       {table}
  //     </div>
  //   )}
  //   {textSummary && (
  //     <div
  //       className="govuk-tabs__panel govuk-tabs__panel--hidden"
  //       id={`textSummary-${id}`}
  //       style={{ backgroundColor: 'white' }}
  //     >
  //       {textSummary}
  //     </div>
  //   )}
  //   {download && (
  //     <div
  //       className="govuk-tabs__panel govuk-tabs__panel--hidden"
  //       id={`download-${id}`}
  //       style={{ backgroundColor: 'white' }}
  //     >
  //       {download}
  //     </div>
  //   )}
  // </div>
}
