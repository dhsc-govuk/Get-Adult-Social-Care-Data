import { describe, expect, it } from 'vitest';
import {
  LA_SELF_SIGNUP_SOURCE,
  buildLaUserFields,
  generateAnalyticsId,
} from '@/lib/laProvisioning';
import { LA_USER_TYPE } from '@/constants';

const LA_EMAIL = 'jane@barnet.gov.uk';
const LA_CODE = 'E09000003';

describe('buildLaUserFields', () => {
  it('grants the LA role and location for an allow-listed address', () => {
    const fields = buildLaUserFields(LA_EMAIL, 'Jane Doe');

    expect(fields).toMatchObject({
      registeredEmail: LA_EMAIL,
      registeredName: 'Jane Doe',
      locationType: LA_USER_TYPE,
      locationId: LA_CODE,
      selectedLocationId: LA_CODE,
      source: LA_SELF_SIGNUP_SOURCE,
      role: 'member',
    });
  });

  it('sets selectedLocationId so the user skips location selection', () => {
    const fields = buildLaUserFields(LA_EMAIL, 'Jane Doe');
    expect(fields?.selectedLocationId).toBe(fields?.locationId);
  });

  it('lowercases registeredEmail so isUserRegistered can compare it', () => {
    const fields = buildLaUserFields('  Jane@BARNET.GOV.UK ', 'Jane');
    expect(fields?.registeredEmail).toBe(LA_EMAIL);
  });

  it('falls back to the email when no name is supplied', () => {
    expect(buildLaUserFields(LA_EMAIL, '')?.registeredName).toBe(LA_EMAIL);
    expect(buildLaUserFields(LA_EMAIL, '   ')?.registeredName).toBe(LA_EMAIL);
    expect(buildLaUserFields(LA_EMAIL, undefined)?.registeredName).toBe(
      LA_EMAIL
    );
  });

  it('assigns a fresh analytics id each time', () => {
    const first = buildLaUserFields(LA_EMAIL, 'Jane');
    const second = buildLaUserFields(LA_EMAIL, 'Jane');
    expect(first?.analyticsId).not.toBe(second?.analyticsId);
  });

  it.each([
    ['an unknown domain', 'jane@gmail.com'],
    ['a subdomain', 'jane@adults.barnet.gov.uk'],
    ['a malformed address', 'jane'],
    ['an empty string', ''],
    ['a non-string', null],
  ])('returns null for %s', (_label, email) => {
    expect(buildLaUserFields(email, 'Jane')).toBeNull();
  });
});

describe('generateAnalyticsId', () => {
  it('matches the format gascd-admin generates', () => {
    expect(generateAnalyticsId()).toMatch(/^ua-[A-Za-z0-9]{32}$/);
  });

  it('is unique across calls', () => {
    const ids = new Set(
      Array.from({ length: 50 }, () => generateAnalyticsId())
    );
    expect(ids.size).toBe(50);
  });
});
