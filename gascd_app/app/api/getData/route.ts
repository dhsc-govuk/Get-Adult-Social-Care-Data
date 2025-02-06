import { Indicator } from '@/data/interfaces/Indicator';
import { NextResponse } from 'next/server';

export async function GET() {
  const indicators: Indicator[] = [
    {
      metric_id: 'population_age_65',
      metric_data_type: 'Monthly',
      metric_date: new Date(),
      location_type: 'Region',
      location_id: 'a',
      numerator: 0,
      denominator: '',
      data_point: 0,
      load_date_time: new Date(),
    },
    {
      metric_id: 'population_age_65',
      metric_data_type: 'Monthly',
      metric_date: new Date(),
      location_type: 'Region',
      location_id: 'b',
      numerator: 0,
      denominator: '',
      data_point: 0,
      load_date_time: new Date(),
    },
    {
      metric_id: 'population_age_65',
      metric_data_type: 'Monthly',
      metric_date: new Date(),
      location_type: 'LA',
      location_id: 'c',
      numerator: 0,
      denominator: '',
      data_point: 0,
      load_date_time: new Date(),
    },
  ];
  return NextResponse.json(indicators);
}
