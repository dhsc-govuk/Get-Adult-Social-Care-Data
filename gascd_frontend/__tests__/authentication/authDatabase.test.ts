import { getAuthOptions } from '@/utils/authDatabase';

describe('getAuthOptions', () => {
  afterEach(() => {
    vi.unstubAllEnvs();
  });

  it('should return default auth options if no matching env vars provided', () => {
    const options = getAuthOptions();
    expect(options.type).toEqual('azure-active-directory-default');
  });

  it('should return access token auth if provided', () => {
    vi.stubEnv('USER_DB_ACCESS_TOKEN', 'my-access-token');
    const options = getAuthOptions();
    expect(options.type).toEqual('azure-active-directory-access-token');
    expect(options.options).toEqual({ token: 'my-access-token' });
  });

  it('should return username/password auth if provided', () => {
    vi.stubEnv('USER_DB_USERNAME', 'test-user');
    vi.stubEnv('USER_DB_PASSWORD', 'mypassword');
    const options = getAuthOptions();
    expect(options.type).toEqual('default');
    expect(options.options).toEqual({
      userName: 'test-user',
      password: 'mypassword',
    });
  });
});
