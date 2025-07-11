import LogService from '@/services/logger/logService';

describe('logEvent Service', () => {
  const mockFetch = jest.fn();
  global.fetch = mockFetch;

  beforeEach(() => {
    mockFetch.mockReset();
  });

  it('should send a POST request to the logger endpoint with the message', async () => {
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve({}),
    });

    const message = 'Test log message';
    await LogService.logEvent(message);

    expect(mockFetch).toHaveBeenCalledWith('/api/logger', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ message }),
    });
  });

  it('should not throw an error when logging', async () => {
    process.env.NEXT_PUBLIC_APP_ENV = '';
    const mockResponse = {
      ok: true,
      json: () => Promise.resolve({ data: 'test' }),
    };
    mockFetch.mockResolvedValueOnce(mockResponse);

    await expect(LogService.logEvent('test')).resolves.not.toThrow();
  });

  it('should log an error to the console if the response is not ok', async () => {
    const mockConsoleError = jest
      .spyOn(console, 'error')
      .mockImplementation(() => {});
    mockFetch.mockResolvedValueOnce({
      ok: false,
      status: 500,
      statusText: 'Internal Server Error',
    });

    await LogService.logEvent('Test message');

    expect(mockConsoleError).toHaveBeenCalledWith(
      'Error logging event: 500 Internal Server Error'
    );
    mockConsoleError.mockRestore();
  });
});
