import { NextRequest, NextResponse } from 'next/server';
import { GET } from '../../app/api/auth/local/route';
import logger from '@/utils/logger';

const mockRequest = new NextRequest(new URL('http://localhost'));
const errorLogSpy = vi.spyOn(logger, 'error');

describe('Local auth handler', () => {
  afterEach(() => {
    vi.unstubAllEnvs();
    vi.clearAllMocks();
  });

  it('should return 404 by default', async () => {
    const response = await GET(mockRequest);
    expect(response.status).toBe(404);
  });

  it('should redirect with error if local user details not provided', async () => {
    vi.stubEnv('LOCAL_AUTH', 'true');
    const makeresponse = async () => {
      return await GET(mockRequest);
    };
    await expect(makeresponse()).rejects.toThrowError(
      expect.objectContaining({
        digest: 'NEXT_REDIRECT;replace;/;307;',
      })
    );
    expect(errorLogSpy).toHaveBeenCalledWith(
      'LOCAL_AUTH_EMAIL or LOCAL_AUTH_PASSWORD not found in env'
    );
  });

  it('should redirect with error if user details provided but email sign up not enabled', async () => {
    vi.stubEnv('LOCAL_AUTH', 'true');
    vi.stubEnv('LOCAL_AUTH_EMAIL', 'test@test.com');
    vi.stubEnv('LOCAL_AUTH_PASSWORD', 'mypassword');
    const makeresponse = async () => {
      return await GET(mockRequest);
    };
    await expect(makeresponse()).rejects.toThrowError(
      expect.objectContaining({
        digest: 'NEXT_REDIRECT;replace;/;307;',
      })
    );
    expect(errorLogSpy).toHaveBeenCalledWith(
      'Could not log in with local auth',
      { response_code: 400 }
    );
  });

  // Please note that there is currently no happy path test here due to
  // the way that email and password support is set up by the env var
  // at startup. Happy path is current tested by the e2e tests
});
