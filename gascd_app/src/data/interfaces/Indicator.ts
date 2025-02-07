export interface Indicator {
  metric_id: string;
  metric_data_type: string;
  metric_date: Date;
  location_type: string;
  location_id: string;
  numerator: number;
  denominator: number;
  data_point: number;
  load_date_time: Date;
}
