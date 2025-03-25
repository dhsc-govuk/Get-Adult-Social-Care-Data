import sql from 'mssql';
import QueryBuilderService from '@/services/query-builder/QueryBuilderService';
import { IndicatorQuery } from '@/data/interfaces/IndicatorQuery';

jest.mock('mssql', () => {
  return {
    Request: jest.fn().mockImplementation(() => {
      return {
        input: jest.fn().mockReturnThis(),
      };
    }),

    ConnectionPool: jest.fn().mockImplementation(() => {
      return {
        connect: jest.fn().mockResolvedValue(true),
        request: jest.fn().mockReturnThis(),
      };
    }),

    VarChar: jest.fn().mockReturnValue('VarChar'),
  };
});

describe('Query Builder Service', () => {
  it('should return a query string with bound metric ids for createGetIndicatorDisplayQuery', () => {
    const mockRequest = new sql.Request();

    const mockQuery: IndicatorQuery = {
      metric_ids: ['1', '2', '3'],
      location_ids: [],
    };

    const result = QueryBuilderService.createGetIndicatorDisplayQuery(
      mockQuery,
      mockRequest
    );

    expect(result.queryString).toBe(
      'SELECT * FROM metrics.metadata WHERE metric_id IN ( @metric_ids0, @metric_ids1, @metric_ids2)'
    );
    expect(result.request_with_param).toBe(mockRequest);
    expect(mockRequest.input).toHaveBeenCalledTimes(3);
  });
  it('should return a query string with bound location ids for createGetLocationNamesQuery', () => {
    const mockRequest = new sql.Request();

    const mockQuery: IndicatorQuery = {
      metric_ids: ['1', '2', '3'],
      location_ids: ['1', '2'],
    };

    const result = QueryBuilderService.createGetLocationNamesQuery(
      mockQuery,
      mockRequest
    );

    expect(result.queryString).toBe(
      'SELECT la_code,la_name FROM ref.la_lookup WHERE la_code IN ( @location_ids0, @location_ids1)'
    );
    expect(result.request_with_param).toBe(mockRequest);
    expect(mockRequest.input).toHaveBeenCalledTimes(2);
  });
  it('should return a query string with bound metric and location ids for createGetSmartInsightsQuery', () => {
    const mockRequest = new sql.Request();

    const mockQuery: IndicatorQuery = {
      metric_ids: ['1', '2', '3'],
      location_ids: ['1', '2'],
    };

    const result = QueryBuilderService.createGetSmartInsightsQuery(
      mockQuery,
      mockRequest
    );

    expect(result.queryString).toBe(
      'SELECT * FROM metrics.smart_insights WHERE metric_id IN ( @metric_ids0, @metric_ids1, @metric_ids2)' +
        ' AND location_id IN( @location_ids0, @location_ids1)'
    );
    expect(result.request_with_param).toBe(mockRequest);
    expect(mockRequest.input).toHaveBeenCalledTimes(5);
  });
  it('should return a query string with bound metric and location ids for createGetIndicatorQuery', () => {
    const mockRequest = new sql.Request();

    const mockQuery: IndicatorQuery = {
      metric_ids: ['1', '2', '3'],
      location_ids: ['1', '2'],
    };

    const result = QueryBuilderService.createGetIndicatorQuery(
      mockQuery,
      mockRequest,
      'LA',
      '1'
    );

    expect(result.queryString).toContain(
      'metric_id IN ( @metric_ids0, @metric_ids1, @metric_ids2)'
    );
    expect(result.queryString).toContain(
      'location_id IN ( @location_ids0, @location_ids1)'
    );
    expect(result.queryString).toContain(
      '(user_access_location_id = @user_location_id '
    );
    expect(result.queryString).toContain(
      '[user_access_location_type] = @user_location_type'
    );
    expect(result.request_with_param).toBe(mockRequest);
    expect(mockRequest.input).toHaveBeenCalledTimes(7);
  });
});
