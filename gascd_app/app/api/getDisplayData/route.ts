import { IndicatorDisplay } from '@/data/interfaces/IndicatorDisplay';
import { NextResponse } from 'next/server';

export async function GET() {
  // to be replaced by query and database response
  const indicatorDisplay: IndicatorDisplay = {
    theme: 'Demand and Capacity',
    category: 'Present demand',
    group_id: 'population_age',
    metric_id: 'population_age_65',
    group: 'Age demographic',
    metric_name: 'Percentage of population aged over 65%',
    description: '',
    numerator: 'Population aged 65+',
    denominator: 'Total population  ',
    mirrored: '',
    data_source: 'NOMIS',
    filter_age: '',
    filter_support_type: '',
    filter_support_setting: '',
    filter_disabilty_status: '',
    filter_care_provider_type: '',
    metric_type: '',
    aggreation: 'National, Region, LA',
    graph: '',
    comments: '',
  };
  return NextResponse.json(indicatorDisplay);
}
