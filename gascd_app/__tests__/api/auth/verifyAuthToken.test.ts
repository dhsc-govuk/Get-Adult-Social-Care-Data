/**
 * @jest-environment node
 */
import jwt from 'jsonwebtoken';
import {
  B2CGraphUser,
  VerifiedToken,
  verifyAuthToken,
} from '../../../src/helpers/auth/verifyAuthToken';

jest.mock('jsonwebtoken', () => ({
  verify: jest.fn(),
}));

const originalFetch = global.fetch;

describe('Verify Auth Token', () => {
  const mockAccessToken = 'mock-access-token';

  afterEach(() => {
    jest.clearAllMocks();
    global.fetch = originalFetch;
  });

  test('rejects access when JWT token fails jwt.verify checks', async () => {
    (jwt.verify as jest.Mock).mockImplementation(
      (token, key, options, callback) => {
        callback(new Error('Invalid Token'), null);
      }
    );

    await expect(verifyAuthToken(mockAccessToken)).rejects.toThrow(
      'Invalid Token'
    );
  });

  test('confirms token is valid if it passess jwt.verify checks', async () => {
    (jwt.verify as jest.Mock).mockImplementation(
      (token, key, options, callback) => {
        const decodedJWT: VerifiedToken = { sub: 'user-1', oid: 'user-1' };
        callback(null, decodedJWT);
      }
    );
    global.fetch = jest.fn().mockResolvedValue({
      ok: true,
      json: async () =>
        ({ id: 'user-1', displayName: 'Test User' }) as B2CGraphUser,
    } as Response);

    const { verifiedToken } = await verifyAuthToken(mockAccessToken);
    expect(jwt.verify).toHaveBeenCalled();
    expect(verifiedToken.oid).toBe('user-1');
  });

  test('resolves when user is returned from graph api call', async () => {
    global.fetch = jest.fn().mockResolvedValue({
      ok: true,
      json: async () =>
        ({ id: 'user-1', displayName: 'Test User' }) as B2CGraphUser,
    } as Response);

    const { b2cGraphUser } = await verifyAuthToken(mockAccessToken);
    expect(b2cGraphUser.id).toBe('user-1');
  });

  test('rejects and throws error when user returned from graph api does not match identity', async () => {
    (jwt.verify as jest.Mock).mockImplementation(
      (token, key, options, callback) => {
        const decoded: VerifiedToken = {
          sub: 'user-123',
          oid: 'user-123',
        };
        callback(null, decoded);
      }
    );
    global.fetch = jest.fn().mockResolvedValue({
      ok: true,
      json: async () =>
        ({ id: 'user-999', displayName: 'Different User' }) as B2CGraphUser,
    } as Response);

    await expect(verifyAuthToken(mockAccessToken)).rejects.toThrow(
      'User identity does not match'
    );
  });
  test('rejects when Graph API returns a non-ok response', async () => {
    (jwt.verify as jest.Mock).mockImplementation(
      (token, key, options, callback) => {
        const decoded: VerifiedToken = {
          sub: 'user-123',
          oid: 'user-123',
        };
        callback(null, decoded);
      }
    );
    global.fetch = jest.fn().mockResolvedValue({
      ok: false,
      json: async () => ({}),
    } as Response);

    // Act & Assert
    await expect(verifyAuthToken(mockAccessToken)).rejects.toThrow(
      'Error calling Graph API'
    );
  });
});
