import React, { useEffect } from 'react';
import {
  Tabs,
  createAll,
} from '../../../public/govuk-frontend/js/govuk-frontend.min.js';

type Props = {
  id: string;
  chart?: React.ReactNode;
  table?: React.ReactNode;
  map?: React.ReactNode;
  download?: React.ReactNode;
};

const DataTabs: React.FC<Props> = ({ id, chart, table, map, download }) => {
  useEffect(() => {
    createAll(Tabs);
  }, []);

  return (
    <>
      <ul className="govuk-tabs__list">
        {map && (
          <li
            className={`govuk-tabs__list-item${map ? ' govuk-tabs__list-item--selected' : ''}`}
          >
            <a className="govuk-tabs__tab" href={`#map-${id}`}>
              Map
            </a>
          </li>
        )}
        {chart && (
          <li
            className={`govuk-tabs__list-item${!map && chart ? ' govuk-tabs__list-item--selected' : ''}`}
          >
            <a className="govuk-tabs__tab" href={`#chart-${id}`}>
              Chart
            </a>
          </li>
        )}
        {table && (
          <li
            className={`govuk-tabs__list-item${!map && !chart && table ? ' govuk-tabs__list-item--selected' : ''}`}
          >
            <a className="govuk-tabs__tab" href={`#table-${id}`}>
              Table
            </a>
          </li>
        )}
        {download && (
          <li
            className={`govuk-tabs__list-item${!map && !chart && !table && download ? ' govuk-tabs__list-item--selected' : ''}`}
          >
            <a className="govuk-tabs__tab" href={`#download-${id}`}>
              Download
            </a>
          </li>
        )}
      </ul>
      {map && (
        <div
          className="govuk-tabs__panel"
          id={`map-${id}`}
          style={{ backgroundColor: 'white' }}
        >
          {map}
        </div>
      )}
      {chart && (
        <div
          className="govuk-tabs__panel"
          id={`chart-${id}`}
          style={{ backgroundColor: 'white' }}
        >
          {chart}
        </div>
      )}
      {table && (
        <div
          className="govuk-tabs__panel govuk-tabs__panel--hidden"
          id={`table-${id}`}
          style={{ backgroundColor: 'white' }}
        >
          {table}
        </div>
      )}
      {download && (
        <div
          className="govuk-tabs__panel govuk-tabs__panel--hidden"
          id={`download-${id}`}
          style={{ backgroundColor: 'white' }}
        >
          {download}
        </div>
      )}
    </>
  );
};

export default DataTabs;
