'use client';

import React, { useEffect, useRef, useState } from 'react';
import Layout from '../../../src/components/common/layout/Layout';
import ContentSidePanel from '../../../src/components/common/panels/contents-side-panel/ContentsSidePanel';
import CapacityTrackerTotalHoursAgencyWorkedService from '../../../src/services/capacity-tracker/CapacityTrackerTotalHoursAgencyWorkedByRegionService';
import MetricDetailsDownloadAndShareBar from '../../../src/components/metric-components/metric-details-download-and-share-bar/MetricDetailsDownloadAndShareBar';
import { getCapacityTrackerData } from '../../api/api';
import ProtectedRoute from '@/components/util-components/protected-route/ProtectedRoute';

const BedsPer1000AdultPopulationPage: React.FC = () => {
  const [capacityTrackerService, setCapacityTrackerService] =
    useState<CapacityTrackerTotalHoursAgencyWorkedService | null>(null);

  const [metricView, setMetricView] = useState('barchart');
  const [locationLevel, setLocationLevel] = useState('region');

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

  return (
    <Layout
      autoSpaceMainContent={false}
      showLoginInformation={true}
      currentPage="beds-per-1000-adult-population"
    >
      <a href="#" className="govuk-back-link">Back</a>
      <div className="govuk-grid-row">
        <div className="govuk-grid-column-one-third">
          <div className="govuk-grid-row">
            <div className="govuk-grid-column-full">              
              <ContentSidePanel />
            </div>
          </div>
        </div>
        <div className="govuk-grid-column-two-thirds">
          <div className="govuk-grid-row">
            <div className="govuk-grid-column-full">
              <h1 className="govuk-heading-l">
                Adult social care beds per 1,000 adult population
              </h1>
            </div>
          </div>

          <div className="govuk-grid-row">
            <div className="govuk-grid-column-full">
              <h2 className="govuk-heading-m">Indicator definition and supporting information</h2>
              <p className="govuk-body">The total number of beds recorded by care providers across 
                health and adult social care, adjusted to a rate of 100,000 adults 
                in the local authority population.</p>     
              <p className="govuk-body">
                'For detailed information about this indicator, including data 
                definitions, data source, update schedule and limitations to be 
                aware of being using this data, go to&nbsp;
                  <a href="#" className="govuk-link">
                    supporting information for this data
                  </a>.
              </p>
            </div>
          </div>
          <div className="govuk-grid-row govuk-!-margin-bottom-2">
            <div className="govuk-grid-column-full">
              <p className="govuk-body">
                
              </p>
            </div>
          </div>
          <div className="govuk-grid-row">
            <div className="govuk-grid-column-full govuk-!-text-align-center">
              <div ref={svgContainerRef}></div>
            </div>
          </div>
          <MetricDetailsDownloadAndShareBar
            data={getCurrentDataSet()}
            filename="PercentageOfTotalWorkHoursCoveredByAgencyStaff"
            xLabel={locationLevel}
          />
        </div>
      </div>
    </Layout>
  );
};

const ProtectedCapacityTrackerPage: React.FC = () => {
  return (
    <ProtectedRoute element={<BedsPer1000AdultPopulationPage />} />
  );
};

export default ProtectedCapacityTrackerPage;
