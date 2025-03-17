import { IndicatorQuery } from '@/data/interfaces/IndicatorQuery';
import sql from 'mssql';

class QueryBuilderService {
  static createGetIndicatorDisplayQuery(
    query: IndicatorQuery,
    request: sql.Request
  ) {
    let request_with_param = request;
    const { paramBind: metric_ids_bind } = this.bindArrayParams(
      request_with_param,
      query.metric_ids,
      'metric_ids'
    );

    const queryString = `SELECT * FROM metrics.metadata WHERE metric_id IN (${metric_ids_bind})`;
    return { queryString, request_with_param };
  }
  static createGetLocationNamesQuery(
    query: IndicatorQuery,
    request: sql.Request
  ) {
    let request_with_param = request;
    const { paramBind: location_ids_bind } = this.bindArrayParams(
      request_with_param,
      query.location_ids,
      'location_ids'
    );

    const queryString = `SELECT la_code,la_name FROM ref.la_lookup WHERE la_code IN (${location_ids_bind})`;

    return { queryString, request_with_param };
  }
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

  static createGetIndicatorQuery(
    query: IndicatorQuery,
    request: sql.Request,
    userLocationType: string,
    userLocationId: string
  ) {
    let request_with_param = request;
    const { paramBind: metric_ids_bind } = this.bindArrayParams(
      request_with_param,
      query.metric_ids,
      'metric_ids'
    );

    const { paramBind: location_ids_bind } = this.bindArrayParams(
      request_with_param,
      query.location_ids,
      'location_ids'
    );

    const queryParts = [
      `
      WITH UserAccess AS (
          SELECT 
              user_access_restricted_flag,
              metric_type,
              metric_location_type,
              metric_location_id
          FROM 
              [access].[metric_location_user_access]
          WHERE 
              [user_access_location_type] = @user_location_type
              AND (user_access_location_id = @user_location_id OR user_access_restricted_flag = 0)
      ),
      RestrictedMetrics AS (
          SELECT 
              *
          FROM 
              [metrics].[all_restricted_metrics]
          WHERE 
              metric_id IN (${metric_ids_bind})
              AND location_id IN (${location_ids_bind})
      ),
      RestrictedMetricsAccess AS (
          SELECT 
              m.*
          FROM 
              RestrictedMetrics AS m
          INNER JOIN UserAccess AS u
          ON (
              (u.user_access_restricted_flag = 1 
                  AND m.access_category = u.metric_type 
                  AND m.location_type = u.metric_location_type
                  AND m.location_id = u.metric_location_id) 
              OR 
              (u.user_access_restricted_flag = 0 
                  AND m.access_category = u.metric_type 
                  AND m.location_type = u.metric_location_type)
          )
      ),
      PublicMetrics AS (
          SELECT 
              *
          FROM 
              [metrics].[all_unrestricted_metrics]
          WHERE 
              metric_id IN (${metric_ids_bind})
              AND location_id IN (${location_ids_bind})
      ),
      CombinedMetrics AS (
          SELECT * FROM RestrictedMetricsAccess
          UNION ALL
          SELECT * FROM PublicMetrics
      ),
      AllMetrics AS (
          SELECT [metric_id]
            ,[metric_date_type]
            ,[metric_date]
            ,[location_type]
            ,[location_id]
            ,[numerator]
            ,[denominator]
            ,[multiplier]
            ,[data_point]
            ,[load_date_time]
      FROM CombinedMetrics)`,
    ];

    if(query.most_recent){
      queryParts.push(`,
        MostRecent AS (SELECT *
          ,ROW_NUMBER() OVER (PARTITION BY location_id ORDER BY CONVERT(DATE, metric_date, 103) DESC) AS date_order
          FROM AllMetrics
        )
        SELECT * FROM MostRecent WHERE date_order = 1`
      );
    }else{
      queryParts.push(`
        SELECT * FROM AllMetrics`
      );
    }

    request.input('user_location_type', userLocationType);
    request.input('user_location_id', userLocationId);

    let queryString = queryParts.join(' ');
    return { queryString, request_with_param };
  }
}

export default QueryBuilderService;
