import React from 'react';
import { Indicator } from '@/data/interfaces/Indicator';
import { LocationNames } from '@/data/interfaces/LocationNames';

interface ConditionalTextProps {
  ColumnHeaders: LocationNames;
  section: string;
  data: Indicator[];
  metric_Id: string;
}

const compareDriversConditionals = (
  data: Indicator[],
  section: string,
  metric_Id: string,
  columnHeaders: LocationNames
): React.ReactNode => {
  const localAuthority = data.find(
    (item) => item.location_type === 'LA' && item.metric_id === metric_Id
  );

  const region = data.find(
    (item) => item.location_type === 'Regional' && item.metric_id === metric_Id
  );

  const country = data.find(
    (item) => item.location_type === 'National' && item.metric_id === metric_Id
  );

  const careProvider =
    section === 'CapacityCareProvider'
      ? data.find(
          (item) =>
            item.location_type === 'CareProviderLocation' &&
            item.metric_id === 'occupancy_rate_total'
        )
      : null;

  if (!localAuthority || !region || !country) {
    return 'Loading...';
  }

  if (section === 'CapacityCareProvider' && !careProvider) {
    return 'Loading...';
  }

  if (
    localAuthority.data_point === null ||
    region.data_point === null ||
    country.data_point === null
  ) {
    return 'Data not available';
  }

  if (section === 'Drivers') {
    if (localAuthority.data_point > country.data_point) {
      return (
        <>
          {columnHeaders.LALabel} has a{' '}
          <strong>
            larger proportion of people aged 65 and over (
            {localAuthority.data_point ?? 'Loading...'}%) compared to the
            national average ({country.data_point ?? 'Loading...'}%).
          </strong>{' '}
          This suggests the need for care services adjusted by population size
          in this local authority may be higher than average.
        </>
      );
    }
    if (localAuthority.data_point < country.data_point) {
      return (
        <>
          {columnHeaders.LALabel} has a{' '}
          <strong>
            smaller proportion of people aged 65 and over (
            {localAuthority.data_point ?? 'Loading...'}%) compared to the
            national average ({country.data_point ?? 'Loading...'}%).
          </strong>{' '}
          This suggests the need for care services adjusted by population size
          in this local authority may be lower than average.
        </>
      );
    }
    return (
      <>
        {columnHeaders.LALabel} has a{' '}
        <strong>
          similar proportion of people aged 65 and over (
          {localAuthority.data_point ?? 'Loading...'}%) compared to the national
          average ({country.data_point ?? 'Loading...'}%).
        </strong>{' '}
        This suggests the need for care services adjusted by population size in
        this local authority may be in line with the national average.
      </>
    );
  }
  if (section === 'CapacityLA') {
    if (localAuthority.data_point > region.data_point) {
      return (
        <>
          Care homes in {columnHeaders.LALabel} are
          <strong>
            {' '}
            operating at {localAuthority.data_point}% occupancy,{' '}
          </strong>
          which is higher than the regional average ({region.data_point}%). This
          suggests a more limited capacity to meet population needs as the
          regional average.
        </>
      );
    }
    if (localAuthority.data_point < region.data_point) {
      return (
        <>
          Care homes in {columnHeaders.LALabel} are
          <strong>
            {' '}
            operating at {localAuthority.data_point}% occupancy,{' '}
          </strong>
          which is lower than the regional average ({region.data_point}%). This
          suggests a greater capacity to meet population needs as the regional
          average.
        </>
      );
    }
    return (
      <>
        Care homes in {columnHeaders.LALabel} are
        <strong>
          {' '}
          operating at {localAuthority.data_point}% occupancy,
        </strong>{' '}
        which is in line with the regional average ({region.data_point}%). This
        suggests a similar capacity to meet population needs as the regional
        average.
      </>
    );
  }
  if (section === 'CapacityCareProvider') {
    if (Number(careProvider?.data_point) > Number(region.data_point)) {
      return (
        <>
          {columnHeaders.CPLabel} has{' '}
          <strong>{careProvider?.data_point ?? 0}% occupancy </strong> for all
          adult social care beds compared to the median occupancy of all care
          homes in {columnHeaders.RegionLabel} ({region.data_point}%),
          suggesting limited availability for new admissions.
        </>
      );
    }
    if (Number(careProvider?.data_point) < Number(region.data_point)) {
      return (
        <>
          {columnHeaders.CPLabel} has{' '}
          <strong>{careProvider?.data_point ?? 0}% occupancy </strong> for all
          adult social care beds compared to the median occupancy of all care
          homes in {columnHeaders.RegionLabel} ({region.data_point}%),
          suggesting greater availability for new admissions.
        </>
      );
    }
    return (
      <>
        {columnHeaders.CPLabel} has{' '}
        <strong>{careProvider?.data_point ?? 0}% occupancy </strong>
        for all adult social care beds compared to the median occupancy of all
        care homes in {columnHeaders.RegionLabel} ({region.data_point}%),
        suggesting a similar level of availability for new admissions.
      </>
    );
  }
};

const ConditionalText: React.FC<ConditionalTextProps> = ({
  section,
  data,
  ColumnHeaders,
  metric_Id,
}) => {
  return (
    <p className="govuk-body">
      {compareDriversConditionals(data, section, metric_Id, ColumnHeaders)}
    </p>
  );
};

export default ConditionalText;
