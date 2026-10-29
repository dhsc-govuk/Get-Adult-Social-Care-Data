import { APIError } from 'better-auth/api';

import {
  LA_DOMAIN_REJECTED_ERROR,
  LA_EMAIL_UNVERIFIED_ERROR,
  LA_SELF_SERVICE_SOURCE,
  buildLaUserFields,
  isOAuthCallback,
  isOneLoginCallback,
  laSignupBeforeCreateHook,
  oauthProviderId,
  recordLaSelfServiceGrant,
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
      { email: 'officer@barnet.gov.uk', emailVerified: true },
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
      { email: 'someone@example.com', emailVerified: true },
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
      laSignupBeforeCreateHook(
        { email: 'someone@example.com', emailVerified: true },
        b2cCtx
      )
    ).rejects.toMatchObject({ message: LA_DOMAIN_REJECTED_ERROR });
    await expect(
      laSignupBeforeCreateHook(
        { email: 'someone@example.com', emailVerified: true },
        socialCtx
      )
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

  it.each([false, undefined, null])(
    'refuses an allowed-domain email whose verification flag is %s',
    async (flag) => {
      const attempt = laSignupBeforeCreateHook(
        { email: 'officer@barnet.gov.uk', emailVerified: flag as any },
        oneLoginCtx
      );
      await expect(attempt).rejects.toBeInstanceOf(APIError);
      await expect(attempt).rejects.toMatchObject({
        status: 'FORBIDDEN',
        message: LA_EMAIL_UNVERIFIED_ERROR,
      });
    }
  );

  it('checks verification before the domain, so an unverified unlisted email reports unverified', async () => {
    await expect(
      laSignupBeforeCreateHook(
        { email: 'someone@example.com', emailVerified: false },
        oneLoginCtx
      )
    ).rejects.toMatchObject({ message: LA_EMAIL_UNVERIFIED_ERROR });
  });

  it('uses error codes that survive Better Auth error redirect formatting', () => {
    expect(LA_EMAIL_UNVERIFIED_ERROR).not.toMatch(/\s/);
    // routes.mjs does result.error.split(' ').join('_'); a code with no spaces
    // arrives unchanged in the ?error= query param the after-hook matches on.
    expect(LA_DOMAIN_REJECTED_ERROR).not.toMatch(/\s/);
  });
});

describe('recordLaSelfServiceGrant', () => {
  const NOW = new Date('2026-10-27T12:00:00Z');
  const fakeDb = () => {
    const inserts: Record<string, any[]> = {};
    const trx = {
      insertInto: (table: string) => ({
        values: (row: any) => ({
          execute: async () => {
            (inserts[table] ??= []).push(row);
          },
        }),
      }),
    };
    const db: any = {
      transaction: () => ({ execute: (fn: any) => fn(trx) }),
    };
    return { db, inserts };
  };

  it('writes an LA reader grant and a user_added audit row', async () => {
    const { db, inserts } = fakeDb();

    await recordLaSelfServiceGrant(
      db,
      {
        id: 'u1',
        email: 'tester@barnet.gov.uk',
        source: LA_SELF_SERVICE_SOURCE,
        locationId: 'E09000003',
        registeredName: 'tester@barnet.gov.uk',
      },
      NOW
    );

    expect(inserts.access_grant).toEqual([
      {
        user_id: 'u1',
        scope_type: 'local_authority',
        la_code: 'E09000003',
        role: 'reader',
        basis: 'la_user',
        status: 'active',
        source: 'self_service',
        granted_at: NOW,
      },
    ]);
    expect(inserts.access_audit).toHaveLength(1);
    expect(inserts.access_audit[0]).toMatchObject({
      action: 'user_added',
      actor_id: 'u1',
      target_user_id: 'u1',
      target_email: 'tester@barnet.gov.uk',
    });
  });

  it('ignores users created any other way', async () => {
    const { db, inserts } = fakeDb();

    await recordLaSelfServiceGrant(db, {
      id: 'u2',
      email: 'test@gascd.local',
      source: null,
      locationId: null,
    });

    expect(inserts).toEqual({});
  });
});
