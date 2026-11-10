import React, { useEffect } from 'react';
import AnalyticsService from '@/services/analytics/analyticsService';
import SharingLabel from '@/components/data-components/SharingLabel';
import SharingSourceNote from '@/components/data-components/SharingSourceNote';
import { SharingCategoryProvider } from '@/components/data-components/SharingCategoryContext';
import { resolveSharingCategory } from '@/data/sharingCategories';

export type DataTabName =
  | 'map'
  | 'chart'
  | 'graph'
  | 'table'
  | 'textSummary'
  | 'download';

type Props = {
  id: string;
  chart?: React.ReactNode;
  graph?: React.ReactNode;
  table?: React.ReactNode;
  textSummary?: React.ReactNode;
  map?: React.ReactNode;
  download?: React.ReactNode;
  /**
   * The tabs in the order shown. Defaults to map, chart, graph, table, text
   * summary, download; a section whose figures are read from the table first
   * can put it before the chart. The first tab present is selected.
   */
  order?: DataTabName[];
  /**
   * Every metric the tabs can show, including any only reachable through a
   * filter. The sharing label is resolved from these once, so it stays the same
   * across tabs and as filters are applied and cleared.
   */
  sharingMetricIds?: string[];
};

const DEFAULT_ORDER: DataTabName[] = [
  'map',
  'chart',
  'graph',
  'table',
  'textSummary',
  'download',
];

const TAB_LABELS: Record<DataTabName, string> = {
  map: 'Map',
  chart: 'Chart',
  graph: 'Graph',
  table: 'Table',
  textSummary: 'Text Summary',
  download: 'Download',
};

// The names the tab changes are tracked under
const TAB_ANALYTICS_NAMES: Record<DataTabName, string> = {
  map: 'map',
  chart: 'chart',
  graph: 'graph',
  table: 'table',
  textSummary: 'text-summary',
  download: 'download',
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
  order = DEFAULT_ORDER,
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

  const contents: Record<DataTabName, React.ReactNode> = {
    map,
    chart,
    graph,
    table,
    textSummary,
    download,
  };
  const tabs = order.filter((name) => contents[name]);

  // Wraps the contents of every tab panel so the label, and the additional
  // source note where one applies, appear on all of them
  const panelContent = (panel: React.ReactNode) => (
    <>
      <SharingLabel category={sharingCategory} />
      {panel}
      <SharingSourceNote category={sharingCategory} />
    </>
  );

  return (
    <SharingCategoryProvider value={sharingCategory}>
      <h3 className="govuk-tabs__title">Contents</h3>
      <ul className="govuk-tabs__list">
        {tabs.map((name, index) => (
          <li
            key={name}
            className={`govuk-tabs__list-item${index === 0 ? ' govuk-tabs__list-item--selected' : ''}`}
          >
            <a
              className="govuk-tabs__tab"
              href={`#${name}-${id}`}
              onClick={() => {
                tabClicked(TAB_ANALYTICS_NAMES[name]);
              }}
            >
              {TAB_LABELS[name]}
            </a>
          </li>
        ))}
      </ul>
      {tabs.map((name, index) => (
        <div
          key={name}
          className={`govuk-tabs__panel${index === 0 ? '' : ' govuk-tabs__panel--hidden'}`}
          id={`${name}-${id}`}
          style={{ backgroundColor: 'white' }}
        >
          {panelContent(contents[name])}
        </div>
      ))}
    </SharingCategoryProvider>
  );
};

export default DataTabs;
