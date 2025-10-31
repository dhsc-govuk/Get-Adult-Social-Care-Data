import SmartInsightsFetchService from '@/services/smart-insights/SmartInsightsFetchService';
import { IndicatorQuery } from '@/data/interfaces/IndicatorQuery';

global.fetch = vi.fn();

describe('SmartInsightsFetchService - getData', () => {
  const mockQuery: IndicatorQuery = {
    metric_ids: ['1', '2', '3'],
    location_ids: ['1', '2'],
  };

  afterEach(() => {
    vi.clearAllMocks();
  });

  it('should return data when fetch is successful', async () => {
    const mockResponse = ['data1', 'data2', 'data3'];

    (fetch as vi.Mock).mockResolvedValue({
      ok: true,
      json: vi.fn().mockResolvedValue(mockResponse),
    });

    const result = await SmartInsightsFetchService.getData(mockQuery);

    expect(fetch).toHaveBeenCalledTimes(1);
    expect(fetch).toHaveBeenCalledWith('/api/get_smart_insights', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(mockQuery),
    });
    expect(result).toEqual(mockResponse);
  });

  it('should throw an error when fetch fails', async () => {
    (fetch as vi.Mock).mockResolvedValue({
      ok: false,
      statusText: 'Internal Server Error',
    });

    await expect(SmartInsightsFetchService.getData(mockQuery)).rejects.toThrow(
      'Failed to fetch data: Internal Server Error'
    );

    expect(fetch).toHaveBeenCalledTimes(1);
    expect(fetch).toHaveBeenCalledWith('/api/get_smart_insights', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(mockQuery),
    });
  });
});
