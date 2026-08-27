'use client';
import React, { useEffect } from 'react';
import AnalyticsService from '@/services/analytics/analyticsService';
import SharingLabel from '@/components/data-components/SharingLabel';
import SharingSourceNote from '@/components/data-components/SharingSourceNote';
import { SharingCategoryProvider } from '@/components/data-components/SharingCategoryContext';
import { resolveSharingCategory } from '@/data/sharingCategories';

type Props = {
  id: string;
  chart?: React.ReactNode;
  graph?: React.ReactNode;
  table?: React.ReactNode;
  textSummary?: React.ReactNode;
  map?: React.ReactNode;
  download?: React.ReactNode;
  /**
   * Every metric the tabs can show, including any only reachable through a
   * filter. The sharing label is resolved from these once, so it stays the same
   * across tabs and as filters are applied and cleared.
   */
  sharingMetricIds?: string[];
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
  sharingMetricIds,
}) => {
  useEffect(() => {
    const setupTabs = async () => {
      // Import this at page load time to avoid NextJS SSR errors
      // https://nextjs.org/docs/app/guides/lazy-loading#loading-external-libraries
      const GOVUKFrontend = await import('govuk-frontend');
      GOVUKFrontend.createAll(GOVUKFrontend.Tabs);
    };
    setupTabs();
  }, []);

  const sharingCategory = resolveSharingCategory(sharingMetricIds);

  // Wraps the contents of every tab panel so the label, and the additional
  // source note where one applies, appear on all of them
  const panelContent = (contents: React.ReactNode) => (
    <>
      <SharingLabel category={sharingCategory} />
      {contents}
      <SharingSourceNote category={sharingCategory} />
    </>
  );

  return (
    <SharingCategoryProvider value={sharingCategory}>
      <h3 className="govuk-tabs__title">Contents</h3>
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
          {panelContent(map)}
        </div>
      )}
      {chart && (
        <div
          className="govuk-tabs__panel"
          id={`chart-${id}`}
          style={{ backgroundColor: 'white' }}
        >
          {panelContent(chart)}
        </div>
      )}
      {graph && (
        <div
          className="govuk-tabs__panel"
          id={`graph-${id}`}
          style={{ backgroundColor: 'white' }}
        >
          {panelContent(graph)}
        </div>
      )}{' '}
      {table && (
        <div
          className="govuk-tabs__panel govuk-tabs__panel--hidden"
          id={`table-${id}`}
          style={{ backgroundColor: 'white' }}
        >
          {panelContent(table)}
        </div>
      )}
      {textSummary && (
        <div
          className="govuk-tabs__panel govuk-tabs__panel--hidden"
          id={`textSummary-${id}`}
          style={{ backgroundColor: 'white' }}
        >
          {panelContent(textSummary)}
        </div>
      )}
      {download && (
        <div
          className="govuk-tabs__panel govuk-tabs__panel--hidden"
          id={`download-${id}`}
          style={{ backgroundColor: 'white' }}
        >
          {panelContent(download)}
        </div>
      )}
    </SharingCategoryProvider>
  );
};

export default DataTabs;
