'use client';

import React, { useEffect, useRef, useState } from 'react';
import Layout from '../../../src/components/common/layout/Layout';
import { Breadcrumb } from '../../../src/data/interfaces/Breadcrumb';
import DataCategoriesSidePanel from '../../../src/components/common/panels/data-categories-side-panel/DataCategoriesSidePanel';
import MainCategoriesSearch from '../../../src/components/common/main-categories-search/MainCategoriesSearch';
import OrganisationFilter from '../../../src/components/common/organisation-filter/OrganisationFilter';
import CapacityTrackerTotalHoursAgencyWorkedService from '../../../src/services/capacity-tracker/CapacityTrackerTotalHoursAgencyWorkedByRegionService';
import MetricDetailsFilterBar from '../../../src/components/metric-components/metric-details-filter-bar/MetricDetailsFilterBar';
import MetricDetailsDownloadAndShareBar from '../../../src/components/metric-components/metric-details-download-and-share-bar/DownloadTableDataCSVLink';
import YourFavouriteMetricsSidePanel from '../../../src/components/common/panels/your-favourite-metrics-side-panel/YourFavouriteMetricsSidePanel';
import DataGuideSidePanel from '../../../src/components/common/panels/data-guide-side-panel/DataGuideSidePanel';
import ReportLinksSidePanel from '../../../src/components/common/panels/report-links-side-panel/ReportLinksSidePanel';
import KnowledgeCentreSidePanel from '../../../src/components/common/panels/knowledge-centre-side-panel/KnowledgeCentreSidePanel';
import DataLimitationsContainer from '../../../src/components/common/data-limitations-container/DataLimitationsContainer';
import SmartInsights from '../../../src/components/common/smart-insights/SmartInsights';
import MetricDescription from '../../../src/components/metric-components/metric-description/MetricDescription';
import MetricTable from '../../../src/components/metric-components/metric-table/MetricTable';
import { getCapacityTrackerData } from '../../api/api';
import ProtectedRoute from '@/components/util-components/protected-route/ProtectedRoute';

const CapacityTrackerTotalHoursWorkedByAgencyPage: React.FC = () => {
  const [capacityTrackerService, setCapacityTrackerService] =
    useState<CapacityTrackerTotalHoursAgencyWorkedService | null>(null);

  const [selectMetricViewValue, setSelectMetricViewValue] =
    useState('barchart');

  const [metricView, setMetricView] = useState('barchart');

  const [selectLocationLevelValue, setSelectLocationLevelValue] =
    useState('region');

  const [locationLevel, setLocationLevel] = useState('region');

  const handleLocationLevelDropdownChange = (selectedValue: string) => {
    setSelectLocationLevelValue(selectedValue);
  };

  const handleUpdateLocationLevel = () => {
    setLocationLevel(selectLocationLevelValue);
  };

  const handleMetricViewDropdownChange = (selectedValue: string) => {
    setSelectMetricViewValue(selectedValue);
  };

  const handleUpdateMetricView = () => {
    setMetricView(selectMetricViewValue);
  };

  useEffect(() => {
    const fetchData = async () => {
      const regionData = await getCapacityTrackerData('region');
      const laData = await getCapacityTrackerData('la');
      setCapacityTrackerService(
        new CapacityTrackerTotalHoursAgencyWorkedService(regionData, laData)
      );
    };
    fetchData();
  }, []);

  const svgContainerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (svgContainerRef.current && capacityTrackerService) {
      const barchart =
        locationLevel === 'region'
          ? capacityTrackerService.createByRegionBarchart()
          : capacityTrackerService.createByLaBarchart();

      svgContainerRef.current.innerHTML = '';
      if (barchart) {
        svgContainerRef.current.appendChild(barchart);
      }
    }
  }, [capacityTrackerService, locationLevel]);

  const getCurrentDataSet = () => {
    if (!capacityTrackerService) return [];
    return locationLevel === 'region'
      ? capacityTrackerService.getTotalHoursAgencyWorkedByRegionData()
      : capacityTrackerService.getTotalHoursAgencyWorkedByLaData();
  };

  const breadcrumbs: Array<Breadcrumb> = [
    {
      text: 'Homepage',
      url: '/home',
    },
    {
      text: 'Capacity tracker data',
      url: '/home',
    },
  ];

  return (
    <Layout
      autoSpaceMainContent={false}
      breadcrumbs={breadcrumbs}
      showLoginInformation={true}
      currentPage="capacity-tracker-total-hours-by-agency"
    >
      <div className="govuk-grid-row">
        <div className="govuk-grid-column-one-third">
          <div className="govuk-grid-row">
            <div className="govuk-grid-column-full">
              <h1 className="govuk-heading-l">Metric Details</h1>
              <DataCategoriesSidePanel />
              <YourFavouriteMetricsSidePanel />
              <DataGuideSidePanel />
              <ReportLinksSidePanel />
              <KnowledgeCentreSidePanel />
            </div>
          </div>
        </div>
        <div className="govuk-grid-column-two-thirds">
          <MainCategoriesSearch />
          <hr className="govuk-section-break govuk-section-break--s govuk-section-break--visible govuk-!-margin-bottom-3"></hr>
          <OrganisationFilter />
          <hr className="govuk-section-break govuk-section-break--s govuk-section-break--visible govuk-!-margin-bottom-7"></hr>
          <MetricDetailsFilterBar
            selectedLocationLevel={selectLocationLevelValue}
            selectedMetricView={selectMetricViewValue}
            onLocationLevelDropdownChange={handleLocationLevelDropdownChange}
            onMetricViewDropdownChange={handleMetricViewDropdownChange}
            onLocationLevelButtonClick={handleUpdateLocationLevel}
            onMetricViewButtonClick={handleUpdateMetricView}
          />
          <div className="govuk-grid-row">
            <div className="govuk-grid-column-full">
              <h1 className="govuk-heading-l">
                Percentage of Total Work Hours Covered by Agency Staff
              </h1>
            </div>
          </div>
          {metricView === 'barchart' ? (
            <div className="govuk-grid-row">
              <div className="govuk-grid-column-full govuk-!-text-align-center">
                <div ref={svgContainerRef}></div>
              </div>
            </div>
          ) : (
            <MetricTable
              headers={[locationLevel, 'Total hours worked that are agency %']}
              tableData={getCurrentDataSet()}
            />
          )}
          <MetricDetailsDownloadAndShareBar
            data={getCurrentDataSet()}
            filename="PercentageOfTotalWorkHoursCoveredByAgencyStaff"
            xLabel={locationLevel}
          />
          <MetricDescription
            title="Percentage of Total Work Hours Covered by Agency Staff"
            body="This chart displays the proportion of total work hours covered
                by agency staff. It highlights variations, with some areas showing
                a greater reliance on agency staff than others. The dotted line 
                represents the median agency coverage across all selection locations."
            dataSource="Capacity Tracker"
          />
          <SmartInsights
            body="The relatively low proportion of agency-covered work hours
                  in London suggests a higher reliance on permanent staff
                  compared to other regions. This may reflect a more stable
                  workforce or greater access to local talent, reducing the
                  need for temporary or agency staff. However, the region's
                  unique economic pressures and high demand for skilled
                  workers could also be contributing factors in shaping this
                  staffing model."
          />
          <DataLimitationsContainer
            header="Data limitations"
            body="MOCK DESCRIPTION Capacity Tracker assessment frequency will 
                  depend on the information they receive and the evidence they 
                  collect. The next assessment is either planned or responsive. 
                  Their approach will be informed by risk, and they will decide 
                  the order of their planned assessments of providers based on 
                  the level of risk. There is a significant backlog in registration 
                  of new providers which results in there begin additional 
                  providers that are not captured in the data"
          />
        </div>
      </div>
    </Layout>
  );
};

const ProtectedCapacityTrackerPage: React.FC = () => {
  return (
    <ProtectedRoute element={<CapacityTrackerTotalHoursWorkedByAgencyPage />} />
  );
};

export default ProtectedCapacityTrackerPage;
