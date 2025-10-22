/**
 * @vi.environment node
 */
import jwt from 'jsonwebtoken';
import {
  B2CGraphUser,
  VerifiedToken,
  verifyAuthToken,
} from '../../../src/helpers/auth/verifyAuthToken';

vi.mock('jsonwebtoken', () => ({
  verify: vi.fn(),
}));

const originalFetch = global.fetch;

describe('Verify Auth Token', () => {
  const mockAccessToken = 'mock-access-token';

  afterEach(() => {
    vi.clearAllMocks();
    global.fetch = originalFetch;
  });

  test('rejects access when JWT token fails jwt.verify checks', async () => {
    (jwt.verify as vi.Mock).mockImplementation(
      (token, key, options, callback) => {
        callback(new Error('Invalid Token'), null);
      }
    );

    await expect(verifyAuthToken(mockAccessToken)).rejects.toThrow(
      'Invalid Token'
    );
  });

  test('confirms token is valid if it passess jwt.verify checks', async () => {
    (jwt.verify as vi.Mock).mockImplementation(
      (token, key, options, callback) => {
        const decodedJWT: VerifiedToken = { sub: 'user-1', oid: 'user-1' };
        callback(null, decodedJWT);
      }
    );
    global.fetch = vi.fn().mockResolvedValue({
      ok: true,
      json: async () =>
        ({ id: 'user-1', displayName: 'Test User' }) as B2CGraphUser,
    } as Response);

    const { verifiedToken } = await verifyAuthToken(mockAccessToken);
    expect(jwt.verify).toHaveBeenCalled();
    expect(verifiedToken.oid).toBe('user-1');
  });
});
