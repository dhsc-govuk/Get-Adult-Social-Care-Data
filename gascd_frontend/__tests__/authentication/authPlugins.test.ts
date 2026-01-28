import { describe, it, expect, vi, beforeEach } from 'vitest';
import { verifyIdToken, getUserInfo } from '@/lib/authUtils';
import { betterFetch } from '@better-fetch/fetch';
import { jwtVerify, createRemoteJWKSet } from 'jose';
import logger from '@/utils/logger';

vi.mock('@better-fetch/fetch', () => ({
  betterFetch: vi.fn(),
}));

vi.mock('jose', () => ({
  jwtVerify: vi.fn(),
  createRemoteJWKSet: vi.fn(),
}));

describe('verifyIdToken', () => {
  const mockIdToken = 'mock.jwt.token';
  const mockDiscoveryUrl =
    'https://auth.example.com/.well-known/openid-configuration';
  const mockClientId = 'test-client-id';
  const mockKeySet: any = {
    foo: 'bar',
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should successfully verify a token and return the payload', async () => {
    // Mock Discovery Document response
    vi.mocked(betterFetch).mockResolvedValue({
      data: {
        jwks_uri: 'https://auth.example.com/keys',
        issuer: 'https://auth.example.com',
      },
      error: null,
    });

    // Mock JWT verification success
    const mockPayload = { sub: 'user123', email: 'test@example.com' };
    vi.mocked(jwtVerify).mockResolvedValue({
      payload: mockPayload,
      protectedHeader: { alg: 'RS256' },
    } as any);

    const result = await verifyIdToken(
      mockIdToken,
      mockDiscoveryUrl,
      mockClientId
    );

    // Assertions
    expect(betterFetch).toHaveBeenCalledWith(mockDiscoveryUrl);
    vi.mocked(createRemoteJWKSet).mockReturnValue(mockKeySet);
    expect(createRemoteJWKSet).toHaveBeenCalledWith(
      new URL('https://auth.example.com/keys'),
      expect.any(Object)
    );
    expect(jwtVerify).toHaveBeenCalledWith(mockIdToken, undefined, {
      issuer: 'https://auth.example.com',
      audience: mockClientId,
    });
    expect(result).toEqual(mockPayload);
  });

  it('should throw an error if jwks_uri is missing from discovery document', async () => {
    vi.mocked(betterFetch).mockResolvedValue({
      data: { issuer: 'https://auth.example.com' }, // No jwks_uri
      error: null,
    });

    await expect(
      verifyIdToken(mockIdToken, mockDiscoveryUrl, mockClientId)
    ).rejects.toThrow('No JWKS URI found in discovery document');
  });

  it('should propagate errors if jwtVerify fails (e.g., expired token)', async () => {
    vi.mocked(betterFetch).mockResolvedValue({
      data: {
        jwks_uri: 'https://auth.example.com/keys',
        issuer: 'https://auth.example.com',
      },
      error: null,
    });

    // Mock a verification failure
    vi.mocked(jwtVerify).mockRejectedValue(new Error('JWTExpired'));

    await expect(
      verifyIdToken(mockIdToken, mockDiscoveryUrl, mockClientId)
    ).rejects.toThrow('JWTExpired');
  });
});

describe('getUserInfo', () => {
  const mockDiscoveryUrl =
    'https://auth.example.com/.well-known/openid-configuration';
  const mockAccessToken = 'valid-access-token';

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should fetch discovery doc and then fetch user info successfully', async () => {
    // Mock first call (Discovery)
    vi.mocked(betterFetch).mockResolvedValueOnce({
      data: { userinfo_endpoint: 'https://auth.example.com/userinfo' },
      error: null,
    });

    // Mock second call (UserInfo)
    const mockApiResponse = {
      sub: 'user-123',
      email: 'alex@example.com',
      email_verified: true,
      nickname: 'Alex',
    };

    vi.mocked(betterFetch).mockResolvedValueOnce({
      data: mockApiResponse,
      error: null,
    });

    const result = await getUserInfo(mockDiscoveryUrl, mockAccessToken);
    expect(betterFetch).toHaveBeenCalledTimes(2);

    // Check that the second call used the Bearer token
    expect(betterFetch).toHaveBeenLastCalledWith(
      'https://auth.example.com/userinfo',
      expect.objectContaining({
        headers: { Authorization: `Bearer ${mockAccessToken}` },
      })
    );

    // Check data mapping
    expect(result).toEqual({
      id: 'user-123',
      email: 'alex@example.com',
      emailVerified: true,
      nickname: 'Alex', // verify other props are also pulled in
      sub: 'user-123',
      email_verified: true,
    });
  });

  it('should throw and log if userinfo_endpoint is missing', async () => {
    vi.mocked(betterFetch).mockResolvedValueOnce({
      data: {}, // Missing userinfo_endpoint
      error: null,
    });

    await expect(
      getUserInfo(mockDiscoveryUrl, mockAccessToken)
    ).rejects.toThrow('No User Info URI found in discovery document');
  });

  it('should use empty string for id if sub is missing', async () => {
    vi.mocked(betterFetch).mockResolvedValueOnce({
      data: { userinfo_endpoint: 'https://auth.example.com/userinfo' },
      error: null,
    });

    vi.mocked(betterFetch).mockResolvedValueOnce({
      data: { email: 'no-sub@example.com', email_verified: false },
      error: null,
    });

    const result = await getUserInfo(mockDiscoveryUrl, mockAccessToken);
    expect(result.id).toBe('');
  });
});
