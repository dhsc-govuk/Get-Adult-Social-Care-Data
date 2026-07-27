import LogService from '@/services/logger/logService';
import { ClientLogCode } from '@/services/logger/clientLogCodes';

describe('logEvent Service', () => {
  const mockFetch = vi.fn();
  global.fetch = mockFetch;

  beforeEach(() => {
    mockFetch.mockReset();
  });

  it('should send a POST request to the logger endpoint with the code', async () => {
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve({}),
    });

    const code = ClientLogCode.LocationFetchFailed;
    await LogService.logEvent(code);

    expect(mockFetch).toHaveBeenCalledWith('/api/logger', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ code }),
    });
  });

  it('should not throw an error when logging', async () => {
    const mockResponse = {
      ok: true,
      json: () => Promise.resolve({ data: 'test' }),
    };
    mockFetch.mockResolvedValueOnce(mockResponse);

    await expect(
      LogService.logEvent(ClientLogCode.AppInsightsInitFailed)
    ).resolves.not.toThrow();
  });

  it('should log an error to the console if the response is not ok', async () => {
    const mockConsoleError = vi
      .spyOn(console, 'error')
      .mockImplementation(() => {});
    mockFetch.mockResolvedValueOnce({
      ok: false,
      status: 500,
      statusText: 'Internal Server Error',
    });

    await LogService.logEvent(ClientLogCode.LocationFetchFailed);

    expect(mockConsoleError).toHaveBeenCalledWith(
      'Error logging event: 500 Internal Server Error'
    );
    mockConsoleError.mockRestore();
  });
});
