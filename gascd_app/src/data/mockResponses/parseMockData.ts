import { Indicator } from '../interfaces/Indicator';

export const mapRawJsonToIndicator = (rawData: any[]): Indicator[] => {
  return rawData.map((item) => ({
    metric_id: item.metric_id,
    metric_date_type: item.metric_date_type,
    metric_date: new Date(item.metric_date),
    location_type: item.location_type,
    location_id: item.location_id,
    numerator: Number(item.numerator),
    multiplier: Number(item.multiplier),
    denominator: Number(item.denominator),
    data_point: Number(item.data_point),
    load_date_time: new Date(item.load_date_time),
  }));
};

export default mapRawJsonToIndicator;
