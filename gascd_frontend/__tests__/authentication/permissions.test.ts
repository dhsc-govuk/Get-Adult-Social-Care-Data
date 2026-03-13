import {
  getCurrentUser,
  isUserRegistered,
  canAccessMetric,
} from '@/lib/permissions';
import { auth } from '@/lib/auth';
import {
  mockSession,
  mockSessionUnregistered,
  mockSessionEmailMismatch,
  mockSessionEmailMatchCase,
  mockSessionCareProvider,
  mockSessionLAUser,
} from '@/test-utils/test-utils';
import { User } from 'better-auth';

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
const mockGetSession = vi.mocked(auth.api.getSession);

vi.mock('server-only', () => ({
  default: vi.fn(),
}));

beforeEach(() => {
  vi.clearAllMocks();
});

describe('getCurrentUser', () => {
  it('should return undefined by default', async () => {
    const user = await getCurrentUser();
    expect(user).toBe(undefined);
  });

  it('should return the current user if there is a session', async () => {
    mockGetSession.mockResolvedValue(mockSession);
    const user = await getCurrentUser();
    expect(user).toStrictEqual(mockSession.user);
  });
});

describe('isUserRegistered', () => {
  it('should be false if no user', async () => {
    const registered = isUserRegistered(null as any);
    expect(registered).toBe(false);
  });

  it('should be false if user but not registered', async () => {
    const registered = isUserRegistered(mockSessionUnregistered.user);
    expect(registered).toBe(false);
  });

  it('should be false if user with email mismatch', async () => {
    const registered = isUserRegistered(mockSessionEmailMismatch.user);
    expect(registered).toBe(false);
  });

  it('should be true for normal session', async () => {
    const registered = isUserRegistered(mockSession.user);
    expect(registered).toBe(true);
  });

  it('should be true for session with mismatched email case', async () => {
    const registered = isUserRegistered(mockSessionEmailMatchCase.user);
    expect(registered).toBe(true);
  });
});

describe('canAccessMetric', () => {
  it('should be false if no user', () => {
    const can_access = canAccessMetric(null as any, 'my_metric');
    expect(can_access).toBe(false);
  });

  it('should be false if unregistered', () => {
    const can_access = canAccessMetric(
      mockSessionUnregistered.user,
      'my_metric'
    );
    expect(can_access).toBe(false);
  });

  it('should be true if unregistered', () => {
    const can_access = canAccessMetric(mockSession.user, 'my_metric');
    expect(can_access).toBe(true);
  });

  it('should be false for pansi metric if not LA user', () => {
    const can_access = canAccessMetric(
      mockSessionCareProvider.user,
      'pansi_test_metric'
    );
    expect(can_access).toBe(false);
  });

  it('should be true for pansi metric if LA user', () => {
    const can_access = canAccessMetric(
      mockSessionLAUser.user,
      'pansi_test_metric'
    );
    expect(can_access).toBe(true);
  });
});
