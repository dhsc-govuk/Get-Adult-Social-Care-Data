import '../../src/styles/main.scss';
import React from 'react';
import Layout from '../../src/components/common/layout/Layout';
import { Breadcrumb } from '../../src/data/interfaces/Breadcrumb';
import HomePageAddFavouriteMetricsPanel from '../../src/components/home-page-components/home-page-add-favourite-metrics-panel/FavouriteMetricsPanel';
import DataCategoriesSidePanel from '../../src/components/common/panels/data-categories-side-panel/DataCategoriesSidePanel';
import MainCategoriesSearch from '../../src/components/common/main-categories-search/MainCategoriesSearch';
import OrganisationFilter from '../../src/components/common/organisation-filter/OrganisationFilter';
import YourFavouriteMetricsSidePanel from '../../src/components/common/panels/your-favourite-metrics-side-panel/YourFavouriteMetricsSidePanel';
import DataGuideSidePanel from '../../src/components/common/panels/data-guide-side-panel/DataGuideSidePanel';
import ReportLinksSidePanel from '../../src/components/common/panels/report-links-side-panel/ReportLinksSidePanel';
import KnowledgeCentreSidePanel from '../../src/components/common/panels/knowledge-centre-side-panel/KnowledgeCentreSidePanel';
import { getCapacityTrackerData } from '../api/api';
import { LoaderData } from '@/data/types/LoaderData';
import HomePageDataUpdatesPanel from '@/components/home-page-components/home-page-data-updates-panel/HomePageDataUpdatesPanel';
import HomePageDataDefinitionsPanel from '@/components/home-page-components/home-page-data-definitions-panel/HomePageDataDefinitionsPanel';
import MetricCardsContainer from '@/components/metric-components/MetricCardsContainer';

export default async function HomePage() {
  const breadcrumbs: Array<Breadcrumb> = [
    {
      text: 'Homepage',
      url: '/home',
    },
  ];

  return (
    <Layout
      autoSpaceMainContent={false}
      breadcrumbs={breadcrumbs}
      showLoginInformation={true}
      currentPage="home"
    >
      <div className="govuk-grid-row">
        <div className="govuk-grid-column-full">
          <h1 className="govuk-heading-l">
            Access data and insights for adult social care in England
          </h1>
        </div>
      </div>
    </Layout>
  );
}
