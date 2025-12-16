import { POST } from '../../../app/api/auth/logout/route';
import { NextRequest } from 'next/server';
import { headers } from 'next/headers';
import { auth } from '@/lib/auth';
import { mockSession } from '@/test-utils/test-utils';

vi.mock('next/headers', () => ({
  headers: vi.fn(),
}));
const mockHeaders = vi.mocked(headers);
mockHeaders.mockResolvedValue(new Headers());

vi.mock('@/lib/auth', () => ({
  auth: {
    api: {
      getSession: vi.fn(),
    },
  },
}));
const mockGetSession = vi.mocked(auth.api.getSession);

describe('Logout API Route', () => {
  const mockEnvVars = process.env;

  beforeEach(() => {
    process.env = { ...mockEnvVars };
    vi.resetAllMocks();
  });

  afterEach(() => {
    process.env = mockEnvVars;
  });

  test('should return 401 if no active session', async () => {
    mockGetSession.mockResolvedValue(null);
    const mockRequest = new NextRequest(
      new URL('http://localhost/api/auth/logout'),
      {
        method: 'POST',
      }
    );

    const response = await POST(mockRequest);
    const json = await response.json();

    expect(response.status).toBe(401);
    expect(json).toEqual({ error: 'Unauthorised: No active session' });
  });

  test('should return 404 if required environment variables are missing', async () => {
    process.env.AZURE_AD_TENANT_NAME = '';
    process.env.AZURE_AD_B2C_USER_SIGN_IN = '';
    process.env.AZURE_AD_B2C_LOGOUT_URL = '';
    mockGetSession.mockResolvedValue(mockSession);

    const mockRequest = new NextRequest(
      new URL('http://localhost/api/auth/logout'),
      {
        method: 'POST',
      }
    );

    const response = await POST(mockRequest);
    const json = await response.json();

    expect(response.status).toBe(404);
    expect(json).toEqual({
      error: 'Missing required environment variables',
    });
  });

  test('should return 200 and a valid logout URL if session exists', async () => {
    process.env.AZURE_AD_TENANT_NAME = 'MOCK_TENANT_NAME';
    process.env.AZURE_AD_B2C_USER_SIGN_IN = 'MOCK_B2C_FLOW';
    process.env.AZURE_AD_B2C_LOGOUT_URL = 'MOCK_REDIRECT_URL';
    process.env.AZURE_AD_CLIENT_ID = '1234';
    mockGetSession.mockResolvedValue(mockSession);

    const mockRequest = new NextRequest(
      new URL('http://localhost/api/auth/logout'),
      {
        method: 'POST',
      }
    );

    const response = await POST(mockRequest);
    const json = await response.json();

    expect(response.status).toBe(200);
    expect(json).toEqual({
      logoutUrl: `https://${process.env.AZURE_AD_TENANT_NAME}.b2clogin.com/${process.env.AZURE_AD_TENANT_NAME}.onmicrosoft.com/${process.env.AZURE_AD_B2C_USER_SIGN_IN}/oauth2/v2.0/logout?post_logout_redirect_uri=${encodeURIComponent(process.env.AZURE_AD_B2C_LOGOUT_URL + '/signed-out')}&client_id=1234`,
    });
  });
});
