import { NextRequest } from 'next/server';
import { POST as LoggerPost } from '../../app/api/logger/route';
import { ClientLogCode } from '@/services/logger/clientLogCodes';
import { mockSession } from '@/test-utils/test-utils';
import { auth } from '@/lib/auth';
import logger from '@/utils/logger';

vi.mock('next/headers', () => ({
  headers: vi.fn(),
}));
vi.mock('@/lib/auth', () => ({
  auth: {
    api: {
      getSession: vi.fn(),
    },
  },
}));
vi.mock('@/utils/logger', () => ({
  default: {
    log: vi.fn(),
  },
}));

const mockGetSession = vi.mocked(auth.api.getSession);
const mockLog = vi.mocked(logger.log);

const loggerUrl = 'http://localhost/api/logger';

describe('logger route', () => {
  beforeEach(() => vi.clearAllMocks());

  it('rejects unauthenticated requests with 401 and logs nothing', async () => {
    mockGetSession.mockResolvedValue(null as any);
    const req = new NextRequest(loggerUrl, {
      method: 'POST',
      body: JSON.stringify({ code: ClientLogCode.LocationFetchFailed }),
    });

    const result = await LoggerPost(req);
    expect(result.status).toBe(401);
    expect(mockLog).not.toHaveBeenCalled();
  });

  it('logs a server-owned message for a valid code', async () => {
    mockGetSession.mockResolvedValue(mockSession as any);
    const req = new NextRequest(loggerUrl, {
      method: 'POST',
      body: JSON.stringify({ code: ClientLogCode.LocationFetchFailed }),
    });

    const result = await LoggerPost(req);
    expect(result.status).toBe(204);
    expect(mockLog).toHaveBeenCalledWith(
      'error',
      'Client: failed to fetch location data',
      { code: ClientLogCode.LocationFetchFailed }
    );
  });

  it('rejects an unknown code with 400 and logs nothing', async () => {
    mockGetSession.mockResolvedValue(mockSession as any);
    const req = new NextRequest(loggerUrl, {
      method: 'POST',
      body: JSON.stringify({ code: 'NOT_A_REAL_CODE' }),
    });

    const result = await LoggerPost(req);
    expect(result.status).toBe(400);
    expect(mockLog).not.toHaveBeenCalled();
  });

  it('rejects a free-text / CRLF injection payload with 400 and logs nothing', async () => {
    mockGetSession.mockResolvedValue(mockSession as any);
    const req = new NextRequest(loggerUrl, {
      method: 'POST',
      body: JSON.stringify({
        code: 'admin\n2026-01-01 00:00:00 INFO forged log line',
      }),
    });

    const result = await LoggerPost(req);
    expect(result.status).toBe(400);
    expect(mockLog).not.toHaveBeenCalled();
  });

  it('rejects a malformed JSON body with 400 and logs nothing', async () => {
    mockGetSession.mockResolvedValue(mockSession as any);
    const req = new NextRequest(loggerUrl, {
      method: 'POST',
      body: 'not json',
    });

    const result = await LoggerPost(req);
    expect(result.status).toBe(400);
    expect(mockLog).not.toHaveBeenCalled();
  });
});
