import React from 'react';
import { Indicator } from '@/data/interfaces/Indicator';

interface ConditionalTextProps {
    ColumnHeaders: string[]
    section: string;
    data: Indicator[]
    locations: string[]
    metric_Id: string
};

  const compareDriversConditionals = (data: Indicator[], locations: string[], section: string, metric_Id: string, columnHeaders: string[]): React.ReactNode => {
    const localAuthority = data.find(
      (item) => item.location_type === 'LA' && item.metric_id === metric_Id
    );

    const region = data.find(
      (item) => item.location_type === 'Regional' && item.metric_id === metric_Id
    );

    const country = data.find(
        (item) => item.location_type === 'National' && item.metric_id === metric_Id
    )

    const careProvider =
    section === 'CapacityCareProvider'
      ? data.find(
          (item) =>
            item.location_type === 'Care provider location' &&
            item.metric_id === 'occupancy_rate_total'
        )
      : null;

    if (!localAuthority || !region || !country) {
      console.warn('Missing data');
      return 'Loading...';
    }

    if (section === 'CapacityCareProvider' && !careProvider) {
        console.warn('Missing careProvider data');
        return 'Loading...';
      }

    if( section === 'Drivers')
    {
        if (localAuthority.data_point > country.data_point) {
            return (
            <>
                {columnHeaders[1]} has a{' '}
                <strong>
                larger proportion of people aged 65 and over (
                {localAuthority.data_point ?? 'Loading...'}%) compared to the national average ({' '}
                {country.data_point ?? 'Loading...'}%).
                </strong>{' '}
                This suggests the need for care services adjusted by population size in this local authority may be higher than
                average.
           </>
            
            );
        }
        if (localAuthority.data_point < country.data_point){
            return (
                <>
                {columnHeaders[1]} has a{' '}
                <strong>
                    smaller proportion of people aged 65 and over (
                    {localAuthority.data_point ?? 'Loading...'}%) compared to the national average ({' '}
                    {country.data_point ?? 'Loading...'}%).
                </strong>{' '}
                This suggests the need for care services adjusted by population size in this local authority may be lower than
                average.
                </>
            );
        }
        return (
            <>
            {columnHeaders[1]} has a{' '}
            <strong>
                similar proportion of people aged 65 and over (
                {localAuthority.data_point ?? 'Loading...'}%) compared to the national average ({' '}
                {country.data_point ?? 'Loading...'}%).
            </strong>{' '}
            This suggests the need for care services adjusted by population size in this local authority may be in line with the national average.
            </>
        );
    }
    if( section === 'CapacityLA'){
        if (localAuthority.data_point > region.data_point) {
            return (
            <>
            Care homes in {locations[1]} are 
            <strong>
            {' '}operating at {localAuthority.data_point}% occupancy,
            </strong>
            which is higher than the regional overage of ({region.data_point}%).
            This suggets a more limited capacity to meet population needs as the regional average.
           </>
            
            );
        }
        if (localAuthority.data_point < region.data_point){
            return (
                <>
                Care homes in {locations[1]} are 
                <strong>
                {' '}operating at {localAuthority.data_point}% occupancy,
                </strong>
                which is lower than the regional overage of ({region.data_point}%).
                This suggets greater capacity to meet population needs as the regional average.
               </>
            );
        }
        return (
            <>
            Care homes in {locations[1]} are 
            <strong>
            {' '}operating at {localAuthority.data_point}% occupancy,
            </strong>
            which is in line with the regional overage of ({region.data_point}%).
            This suggets a similar capacity to meet population needs as the regional average.
           </>
        );
    }
    if( section === 'CapacityCareProvider'){
        if (careProvider?.data_point ?? 0 > region.data_point) {
            return (
            <>
            {locations[0]} has a <strong>({careProvider?.data_point ?? 0}%) occupancy </strong> occupancy for all adult social care beds compared to the median occupancy of all care homes in {locations[1]} ({region.data_point}%), suggesting limited availability for new admissions.
           </>
            
            );
        }
        if (careProvider?.data_point ?? 0 < region.data_point){
            return (
                <>
                {locations[0]} has <strong>({careProvider?.data_point ?? 0}%) occupancy </strong> for all adult social care beds compared to the median occupancy of all care homes in Suffolk {locations[1]} ({region.data_point}%), suggesting greater availability for new admissions.
               </>
            );
        }
        return (
            <>
            {locations[0]} has <strong>({careProvider?.data_point ?? 0}%) occupancy </strong> occupancy for all adult social care beds, compared to the median occupancy of all care homes in {locations[1]} ({region.data_point}%), suggesting a similar level of availability for new admissions.
           </>
        );
    }
    
  };

const ConditionalText: React.FC<ConditionalTextProps> = ({section, data, ColumnHeaders, locations, metric_Id}) => {
    return( 
        <p className="govuk-body">
        {compareDriversConditionals(data, locations, section, metric_Id, ColumnHeaders)}
    </p>
    )
} 

export default ConditionalText