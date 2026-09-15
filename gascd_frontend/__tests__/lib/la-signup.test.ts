import { APIError } from 'better-auth/api';

import {
  LA_DOMAIN_REJECTED_ERROR,
  LA_SELF_SERVICE_SOURCE,
  buildLaUserFields,
  isOAuthCallback,
  isOneLoginCallback,
  laSignupBeforeCreateHook,
  oauthProviderId,
} from '@/lib/la-signup';

// Better Auth passes the endpoint's route pattern and params, not the request URL.
const oneLoginCtx = {
  path: '/oauth2/callback/:providerId',
  params: { providerId: 'govuk-one-login' },
} as any;
const b2cCtx = {
  path: '/oauth2/callback/:providerId',
  params: { providerId: 'azure-ad-b2c-signin' },
} as any;
const socialCtx = { path: '/callback/:id', params: { id: 'github' } } as any;
const emailSignUpCtx = { path: '/sign-up/email' } as any;

afterEach(() => {
  vi.unstubAllEnvs();
});

describe('buildLaUserFields', () => {
  it('populates LA fields from the email domain', () => {
    const fields = buildLaUserFields('Officer@Barnet.gov.uk');
    expect(fields).toMatchObject({
      locationId: 'E09000003',
      selectedLocationId: 'E09000003',
      locationType: 'LA',
      registeredEmail: 'officer@barnet.gov.uk',
      registeredName: 'officer@barnet.gov.uk',
      source: LA_SELF_SERVICE_SOURCE,
      role: 'member',
    });
    expect(fields?.analyticsId).toEqual(expect.any(String));
    expect(fields?.analyticsId.length).toBeGreaterThan(0);
  });

  it('returns null for a domain that is not allowed', () => {
    expect(buildLaUserFields('someone@example.com')).toBeNull();
    expect(buildLaUserFields('someone@edgehealth.co.uk')).toBeNull();
  });

  it('honours LA_INTERNAL_TEST_DOMAINS', () => {
    vi.stubEnv('LA_INTERNAL_TEST_DOMAINS', 'edgehealth.co.uk=E09000003');
    expect(buildLaUserFields('tester@edgehealth.co.uk')?.locationId).toBe(
      'E09000003'
    );
  });

  it('gives each new user a distinct analytics id', () => {
    const a = buildLaUserFields('a@barnet.gov.uk')!;
    const b = buildLaUserFields('b@barnet.gov.uk')!;
    expect(a.analyticsId).not.toBe(b.analyticsId);
  });
});

describe('isOAuthCallback / oauthProviderId / isOneLoginCallback', () => {
  it('recognises generic and social OAuth callback route patterns', () => {
    expect(isOAuthCallback(oneLoginCtx)).toBe(true);
    expect(isOAuthCallback(b2cCtx)).toBe(true);
    expect(isOAuthCallback(socialCtx)).toBe(true);
    expect(isOAuthCallback(emailSignUpCtx)).toBe(false);
    expect(isOAuthCallback(null)).toBe(false);
    expect(isOAuthCallback(undefined)).toBe(false);
    expect(isOAuthCallback({} as any)).toBe(false);
  });

  it('reads the provider from route params', () => {
    expect(oauthProviderId(oneLoginCtx)).toBe('govuk-one-login');
    expect(oauthProviderId(socialCtx)).toBe('github');
    expect(oauthProviderId(emailSignUpCtx)).toBeUndefined();
  });

  it('identifies the One Login callback specifically', () => {
    expect(isOneLoginCallback(oneLoginCtx)).toBe(true);
    expect(isOneLoginCallback(b2cCtx)).toBe(false);
    expect(isOneLoginCallback(emailSignUpCtx)).toBe(false);
  });
});

describe('laSignupBeforeCreateHook', () => {
  it('adds LA fields for an allowed One Login email', async () => {
    const result = await laSignupBeforeCreateHook(
      { email: 'officer@barnet.gov.uk' },
      oneLoginCtx
    );
    expect(result?.data).toMatchObject({
      locationId: 'E09000003',
      locationType: 'LA',
      registeredEmail: 'officer@barnet.gov.uk',
      role: 'member',
    });
  });

  it('refuses a One Login email on a domain that is not allowed', async () => {
    const attempt = laSignupBeforeCreateHook(
      { email: 'someone@example.com' },
      oneLoginCtx
    );
    await expect(attempt).rejects.toBeInstanceOf(APIError);
    await expect(attempt).rejects.toMatchObject({
      status: 'FORBIDDEN',
      message: LA_DOMAIN_REJECTED_ERROR,
    });
  });

  it('applies the same check to sign-ups via any other OAuth provider', async () => {
    await expect(
      laSignupBeforeCreateHook({ email: 'someone@example.com' }, b2cCtx)
    ).rejects.toMatchObject({ message: LA_DOMAIN_REJECTED_ERROR });
    await expect(
      laSignupBeforeCreateHook({ email: 'someone@example.com' }, socialCtx)
    ).rejects.toMatchObject({ message: LA_DOMAIN_REJECTED_ERROR });
  });

  it('leaves non-OAuth creation paths untouched (local email seed)', async () => {
    await expect(
      laSignupBeforeCreateHook({ email: 'someone@example.com' }, emailSignUpCtx)
    ).resolves.toBeUndefined();
    await expect(
      laSignupBeforeCreateHook({ email: 'someone@example.com' }, null)
    ).resolves.toBeUndefined();
  });

  it('uses an error code that survives Better Auth error redirect formatting', () => {
    // routes.mjs does result.error.split(' ').join('_'); a code with no spaces
    // arrives unchanged in the ?error= query param the after-hook matches on.
    expect(LA_DOMAIN_REJECTED_ERROR).not.toMatch(/\s/);
  });
});
