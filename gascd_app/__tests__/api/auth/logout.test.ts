/**
 * @jest-environment node
 */

import { POST } from '../../../app/api/auth/logout/route';
import { getServerSession } from 'next-auth';
import { NextRequest } from 'next/server';

jest.mock('next-auth', () => ({
  getServerSession: jest.fn(),
}));

describe('Logout API Route', () => {
  const mockEnvVars = process.env;

  beforeEach(() => {
    jest.resetModules();
    jest.resetAllMocks();
    process.env = { ...mockEnvVars };
  });

  afterEach(() => {
    process.env = mockEnvVars;
  });

  test('should return 401 if no active session', async () => {
    (getServerSession as jest.Mock).mockReturnValue(null);

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

  test('should return 500 if required environment variables are missing', async () => {
    process.env.AZURE_AD_TENANT_NAME = '';
    process.env.AZURE_AD_B2C_USER_SIGN_IN = '';
    process.env.AZURE_AD_B2C_LOGOUT_URL = '';

    (getServerSession as jest.Mock).mockResolvedValue({
      idToken: 'authorised-id-token',
    });

    const mockRequest = new NextRequest(
      new URL('http://localhost/api/auth/logout'),
      {
        method: 'POST',
      }
    );

    const response = await POST(mockRequest);
    const json = await response.json();

    expect(response.status).toBe(500);
    expect(json).toEqual({
      error: 'Missing required environment variables',
    });
  });

  test('should return 200 and a valid logout URL if session exists', async () => {
    process.env.AZURE_AD_TENANT_NAME = 'MOCK_TENANT_NAME';
    process.env.AZURE_AD_B2C_USER_SIGN_IN = 'MOCK_B2C_FLOW';
    process.env.AZURE_AD_B2C_LOGOUT_URL = 'MOCK_REDIRECT_URL';

    (getServerSession as jest.Mock).mockResolvedValue({
      idToken: 'authorised-id-token',
    });

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
      logoutUrl: `https://${process.env.AZURE_AD_TENANT_NAME}.b2clogin.com/${process.env.AZURE_AD_TENANT_NAME}.onmicrosoft.com/${process.env.AZURE_AD_B2C_USER_SIGN_IN}/oauth2/v2.0/logout?post_logout_redirect_uri=${encodeURIComponent(process.env.AZURE_AD_B2C_LOGOUT_URL)}&id_token_hint=authorised-id-token`,
    });
  });
});
