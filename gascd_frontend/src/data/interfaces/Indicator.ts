export interface Indicator {
  metric_id: string;
  metric_date_type: string;
  metric_date: any;
  location_type: string;
  location_id: string;
  numerator: number;
  multiplier: number;
  denominator: number;
  data_point: number | null;
  load_date_time: Date;
}

export type UIMetric = Pick<
  Indicator,
  'data_point' | 'location_type' | 'location_id' | 'metric_date' | 'metric_id'
>;
