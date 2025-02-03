'use client';
import GraphTest from '@/components/graphs/BarChart';
import React, { useEffect, useRef, useState } from 'react';
import { getCapacityTrackerData } from '../api/api';
import CapacityTrackerTotalHoursAgencyWorkedService from '@/services/capacity-tracker/CapacityTrackerTotalHoursAgencyWorkedByRegionService';
import MetricDetailsFilterBar from '@/components/metric-components/metric-details-filter-bar/MetricDetailsFilterBar';
import IndicatorService from '@/services/indicator/IndicatorService';
import Layout from '@/components/common/layout/Layout';
import IndicatorView from '@/components/indicator-components/IndicatorView';

const barChartPage: React.FC = () => {
  const [indicatorService, setIndicatorService] =
    useState<IndicatorService | null>(null);

  const [selectMetricViewValue, setSelectMetricViewValue] =
    useState('barchart');

  const [indicatorView, setIndicatorView] = useState('barchart');

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
    setIndicatorView(selectMetricViewValue);
  };

  useEffect(() => {
    const fetchData = async () => {
      const regionData = await getCapacityTrackerData('region');
      const laData = await getCapacityTrackerData('la');
      setIndicatorService(new IndicatorService(regionData, laData));
    };
    fetchData();
  }, []);

  const svgContainerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (svgContainerRef.current && indicatorService) {
      const barchart =
        locationLevel === 'region'
          ? indicatorService.createBarchart(
              'region',
              'Regions',
              'Total hours worked that are agency'
            )
          : indicatorService.createBarchart(
              'la',
              'Local Authorities',
              'Total hours worked that are agency'
            ); // this would be passed in from the metadata

      svgContainerRef.current.innerHTML = '';
      if (barchart) {
        svgContainerRef.current.appendChild(barchart);
      }
    }
  }, [indicatorService, locationLevel]);

  return (
    <Layout showLoginInformation={false} currentPage={''}>
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
      <IndicatorView indicatorView={indicatorView} svgRef={svgContainerRef} />
    </Layout>
  );
};

export default barChartPage;
