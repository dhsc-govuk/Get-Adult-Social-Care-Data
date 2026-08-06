import { logLogoutEvent } from '@/lib/authHooks';
import { getSessionFromCtx } from 'better-auth/api';
import logger from '@/utils/logger';

vi.mock('better-auth/api', () => ({
  getSessionFromCtx: vi.fn(),
}));
vi.mock('@/utils/logger', () => ({
  default: { info: vi.fn() },
}));

const mockGetSession = vi.mocked(getSessionFromCtx);
const mockLoggerInfo = vi.mocked(logger.info);

// Minimal stand-in for the better-auth endpoint context; only `path` is read
// directly, everything else is forwarded to the (mocked) getSessionFromCtx.
const ctx = (path = '/sign-out') => ({ path }) as any;

describe('logLogoutEvent (logout audit hook)', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  // Regression test for the pen-test finding: an unauthenticated /sign-out
  // request must not be recorded as a successful logout (log integrity).
  it('does NOT log a logout when there is no session (unauthenticated /sign-out)', async () => {
    mockGetSession.mockResolvedValue(null as any);

    await logLogoutEvent(ctx());

    expect(mockLoggerInfo).not.toHaveBeenCalled();
  });

  it('logs the logout with the userid when a valid session is ended', async () => {
    mockGetSession.mockResolvedValue({ user: { id: 'user-123' } } as any);

    await logLogoutEvent(ctx());

    expect(mockLoggerInfo).toHaveBeenCalledTimes(1);
    expect(mockLoggerInfo).toHaveBeenCalledWith('User logged out', {
      userid: 'user-123',
    });
  });

  it('does NOT log when resolving the session throws', async () => {
    mockGetSession.mockRejectedValue(new Error('session lookup failed'));

    await logLogoutEvent(ctx());

    expect(mockLoggerInfo).not.toHaveBeenCalled();
  });

  it('ignores non-sign-out paths without even resolving a session', async () => {
    await logLogoutEvent(ctx('/sign-in/email'));

    expect(mockGetSession).not.toHaveBeenCalled();
    expect(mockLoggerInfo).not.toHaveBeenCalled();
  });
});
