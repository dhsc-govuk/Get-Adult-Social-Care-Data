import { IndicatorQuery } from '@/data/interfaces/IndicatorQuery';

class QueryBuilderService {
  static createGetIndicatorQuery(query: IndicatorQuery) {
    const queryParts = [
      'SELECT * FROM metrics.all_metrics WHERE metric_id = @metric_id',
    ];
    const params = [{ key: 'metric_id', value: query.metric_id }];

    if (query.location_id) {
      queryParts.push('AND location_id = @location_id');
      params.push({ key: 'location_id', value: query.location_id });
    }

    if (query.additional_metric_id) {
      queryParts.push(
        'OR metric_id = @additional_metric_id AND location_id = @location_id'
      );
      params.push({
        key: 'additional_metric_id',
        value: query.additional_metric_id,
      });
    }

    const queryString = queryParts.join(' ');

    return { queryString, params };
  }
}

export default QueryBuilderService;
