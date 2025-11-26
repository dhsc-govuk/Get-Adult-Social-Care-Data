import { getAuthOptions } from '@/lib/authDatabase';

describe('getAuthOptions', () => {
  afterEach(() => {
    vi.unstubAllEnvs();
  });

  it('should return default auth options if no matching env vars provided', () => {
    const options = getAuthOptions();
    expect(options.type).toEqual('azure-active-directory-default');
    expect(options.options).toEqual({ clientId: undefined });
  });

  it('should return default auth options with client id', () => {
    vi.stubEnv('SQL_MANAGED_IDENTITY_CLIENT_ID', 'test-clientid');
    const options = getAuthOptions();
    expect(options.type).toEqual('azure-active-directory-default');
    expect(options.options).toEqual({ clientId: 'test-clientid' });
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

  it('should raise an error if username but no password provided', () => {
    vi.stubEnv('USER_DB_USERNAME', 'test-user');
    const options_method = () => {
      getAuthOptions();
    };
    expect(options_method).toThrow(
      'USER_DB_USERNAME supplied with no corresponding USER_DB_PASSWORD'
    );
  });
});
