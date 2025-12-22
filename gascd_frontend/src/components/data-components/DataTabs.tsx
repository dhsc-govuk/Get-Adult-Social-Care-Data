import React, { useEffect } from 'react';
import {
  Tabs,
  createAll,
} from '../../../public/govuk-frontend/js/govuk-frontend.min.js';
import AnalyticsService from '@/services/analytics/analyticsService';

type Props = {
  id: string;
  chart?: React.ReactNode;
  graph?: React.ReactNode;
  table?: React.ReactNode;
  textSummary?: React.ReactNode;
  map?: React.ReactNode;
  download?: React.ReactNode;
};

const tabClicked = (tabname: string) => {
  AnalyticsService.trackDataTabChange(tabname);
};

const DataTabs: React.FC<Props> = ({
  id,
  chart,
  graph,
  table,
  map,
  download,
  textSummary,
}) => {
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
            <a
              className="govuk-tabs__tab"
              href={`#map-${id}`}
              onClick={() => {
                tabClicked('map');
              }}
            >
              Map
            </a>
          </li>
        )}
        {chart && (
          <li
            className={`govuk-tabs__list-item${!map && chart ? ' govuk-tabs__list-item--selected' : ''}`}
          >
            <a
              className="govuk-tabs__tab"
              href={`#chart-${id}`}
              onClick={() => {
                tabClicked('chart');
              }}
            >
              Chart
            </a>
          </li>
        )}
        {graph && (
          <li
            className={`govuk-tabs__list-item${!map && !chart && graph ? ' govuk-tabs__list-item--selected' : ''}`}
          >
            <a
              className="govuk-tabs__tab"
              href={`#graph-${id}`}
              onClick={() => {
                tabClicked('graph');
              }}
            >
              Graph
            </a>
          </li>
        )}
        {table && (
          <li
            className={`govuk-tabs__list-item${!map && !chart && !graph && table ? ' govuk-tabs__list-item--selected' : ''}`}
          >
            <a
              className="govuk-tabs__tab"
              href={`#table-${id}`}
              onClick={() => {
                tabClicked('table');
              }}
            >
              Table
            </a>
          </li>
        )}
        {textSummary && (
          <li
            className={`govuk-tabs__list-item${!map && !chart && !table && textSummary ? ' govuk-tabs__list-item--selected' : ''}`}
          >
            <a
              className="govuk-tabs__tab"
              href={`#textSummary-${id}`}
              onClick={() => {
                tabClicked('text-summary');
              }}
            >
              Text Summary
            </a>
          </li>
        )}
        {download && (
          <li
            className={`govuk-tabs__list-item${!map && !chart && !table && !textSummary && download ? ' govuk-tabs__list-item--selected' : ''}`}
          >
            <a
              className="govuk-tabs__tab"
              href={`#download-${id}`}
              onClick={() => {
                tabClicked('download');
              }}
            >
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
      {graph && (
        <div
          className="govuk-tabs__panel"
          id={`graph-${id}`}
          style={{ backgroundColor: 'white' }}
        >
          {graph}
        </div>
      )}{' '}
      {table && (
        <div
          className="govuk-tabs__panel govuk-tabs__panel--hidden"
          id={`table-${id}`}
          style={{ backgroundColor: 'white' }}
        >
          {table}
        </div>
      )}
      {textSummary && (
        <div
          className="govuk-tabs__panel govuk-tabs__panel--hidden"
          id={`textSummary-${id}`}
          style={{ backgroundColor: 'white' }}
        >
          {textSummary}
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
