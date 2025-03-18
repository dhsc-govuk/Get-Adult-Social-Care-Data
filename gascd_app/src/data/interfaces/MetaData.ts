export interface MetaData {
  group_id: string;
  metric_id: string;
  group_name: string;
  description: string;
  numerator_description: string;
  denominator_description: string;
  data_source: string;
  filter_bedtype: string;
  metric_data_type: string;
  methodology: string;
  limitations: string;
  access_category: string;
  metric_type: string;
  is_live: string;
  deep_dive: string;
  load_date_time: Date;
}
