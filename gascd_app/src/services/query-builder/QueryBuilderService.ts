import { IndicatorQuery } from '@/data/interfaces/IndicatorQuery';
import sql from 'mssql';

class QueryBuilderService {
  static createGetSmartInsightsQuery(
    query: IndicatorQuery,
    request: sql.Request
  ) {
    let request_with_param = request;
    const { paramBind: metric_ids_bind } = this.bindArrayParams(
      request_with_param,
      query.metric_ids,
      'metric_ids'
    );

    const queryParts = [
      `SELECT * FROM metrics.smart_insights WHERE metric_id IN (${metric_ids_bind})`,
    ];

    if (query.location_ids) {
      const { paramBind: location_ids_bind } = this.bindArrayParams(
        request_with_param,
        query.location_ids,
        'location_ids'
      );
      queryParts.push(`AND location_id IN(${location_ids_bind})`);
    }

    let queryString = queryParts.join(' ');
    return { queryString, request_with_param };
  }

  static bindArrayParams(
    request: sql.Request,
    params: string[],
    paramName: string
  ): { paramBind: string; request: sql.Request } {
    let n = 0;
    let paramBind = '';
    for (const param of params) {
      paramBind += `${n !== 0 ? ',' : ''} @${paramName}${n}`;
      request = request.input(`${paramName}${n}`, sql.VarChar(255), param);
      n += 1;
    }
    return { paramBind, request };
  }

  static createGetIndicatorQuery(query: IndicatorQuery, request: sql.Request) {
    let request_with_param = request;
    const { paramBind: metric_ids_bind } = this.bindArrayParams(
      request_with_param,
      query.metric_ids,
      'metric_ids'
    );

    const queryParts = [
      `SELECT * FROM metrics.all_metrics WHERE metric_id IN (${metric_ids_bind})`,
    ];

    if (query.location_ids) {
      const { paramBind: location_ids_bind } = this.bindArrayParams(
        request_with_param,
        query.location_ids,
        'location_ids'
      );
      queryParts.push(`AND location_id IN(${location_ids_bind})`);
    }

    let queryString = queryParts.join(' ');
    return { queryString, request_with_param };
  }
}

export default QueryBuilderService;
