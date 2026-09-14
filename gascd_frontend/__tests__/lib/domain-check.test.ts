import fs from 'node:fs';
import path from 'node:path';
import {
  ACCEPTABLE_EMAIL_DOMAINS,
  LA_EMAIL_DOMAIN_ID_MAP,
  isAcceptableEmail,
  isNonEmptyString,
  parseInternalTestDomains,
  resolveLaEmail,
  validateFormFields,
} from '@/lib/domain-check';

const INTERNAL =
  'dhsc.gov.uk=E09000027,edgehealth.co.uk=E09000003,deloitte.co.uk=E08000024';

afterEach(() => {
  vi.unstubAllEnvs();
});

describe('LA_EMAIL_DOMAIN_ID_MAP', () => {
  it('matches the early-access domain mapping source file', () => {
    const sourcePath = path.resolve(
      __dirname,
      '../../../scripts/early_access/la_domain_mapping.json'
    );
    const source = JSON.parse(fs.readFileSync(sourcePath, 'utf8'));
    expect(LA_EMAIL_DOMAIN_ID_MAP).toEqual(source);
  });

  it('exposes every mapped domain as acceptable', () => {
    expect(ACCEPTABLE_EMAIL_DOMAINS).toEqual(
      Object.keys(LA_EMAIL_DOMAIN_ID_MAP)
    );
  });

  it('does not contain internal test domains', () => {
    for (const domain of [
      'dhsc.gov.uk',
      'edgehealth.co.uk',
      'deloitte.co.uk',
    ]) {
      expect(ACCEPTABLE_EMAIL_DOMAINS).not.toContain(domain);
    }
  });
});

describe('resolveLaEmail', () => {
  it('returns the ONS code for a listed council domain', () => {
    expect(resolveLaEmail('officer@barnet.gov.uk')).toEqual({
      domain: 'barnet.gov.uk',
      location_id: 'E09000003',
      email: 'officer@barnet.gov.uk',
    });
  });

  it('is case-insensitive on the domain', () => {
    expect(resolveLaEmail('Officer@Barnet.GOV.UK')?.location_id).toBe(
      'E09000003'
    );
  });

  it('rejects an unlisted domain', () => {
    expect(resolveLaEmail('someone@example.com')).toBeNull();
  });

  it('rejects a subdomain of a listed domain', () => {
    expect(resolveLaEmail('someone@mail.barnet.gov.uk')).toBeNull();
  });

  it('rejects values without exactly one @', () => {
    expect(resolveLaEmail('not-an-email')).toBeNull();
    expect(resolveLaEmail('')).toBeNull();
    expect(resolveLaEmail('a@b@barnet.gov.uk')).toBeNull();
  });

  it('accepts extra domains only when supplied', () => {
    const extra = { 'edgehealth.co.uk': 'E09000003' };
    expect(resolveLaEmail('x@edgehealth.co.uk')).toBeNull();
    expect(resolveLaEmail('x@EdgeHealth.co.uk', extra)?.location_id).toBe(
      'E09000003'
    );
  });

  it('prefers the public map over an extra domain with the same name', () => {
    expect(
      resolveLaEmail('x@barnet.gov.uk', { 'barnet.gov.uk': 'OVERRIDE' })
        ?.location_id
    ).toBe('E09000003');
  });
});

describe('parseInternalTestDomains', () => {
  it('parses comma-separated domain=code pairs', () => {
    expect(parseInternalTestDomains(INTERNAL)).toEqual({
      'dhsc.gov.uk': 'E09000027',
      'edgehealth.co.uk': 'E09000003',
      'deloitte.co.uk': 'E08000024',
    });
  });

  it('trims whitespace and lower-cases domains', () => {
    expect(
      parseInternalTestDomains(
        ' DHSC.gov.uk = E09000027 , edgehealth.co.uk=E09000003 '
      )
    ).toEqual({ 'dhsc.gov.uk': 'E09000027', 'edgehealth.co.uk': 'E09000003' });
  });

  it('returns an empty map when unset or empty', () => {
    expect(parseInternalTestDomains(undefined)).toEqual({});
    expect(parseInternalTestDomains(null)).toEqual({});
    expect(parseInternalTestDomains('')).toEqual({});
    expect(parseInternalTestDomains('   ')).toEqual({});
  });

  it('ignores malformed entries and keeps the valid ones', () => {
    expect(
      parseInternalTestDomains(
        'dhsc.gov.uk=E09000027,nocode,=E1,bare=E2,a=b=c,edgehealth.co.uk=E09000003,,'
      )
    ).toEqual({ 'dhsc.gov.uk': 'E09000027', 'edgehealth.co.uk': 'E09000003' });
  });
});

describe('isAcceptableEmail', () => {
  it('returns null for non-string input', () => {
    expect(isAcceptableEmail(undefined)).toBeNull();
    expect(isAcceptableEmail(null)).toBeNull();
    expect(isAcceptableEmail(42)).toBeNull();
    expect(isAcceptableEmail({ email: 'x@barnet.gov.uk' })).toBeNull();
  });

  it('accepts a council address without any environment config', () => {
    expect(isAcceptableEmail('x@barnet.gov.uk')).not.toBeNull();
  });

  it('rejects internal domains unless LA_INTERNAL_TEST_DOMAINS grants them', () => {
    expect(isAcceptableEmail('x@edgehealth.co.uk')).toBeNull();

    vi.stubEnv('LA_INTERNAL_TEST_DOMAINS', INTERNAL);
    expect(isAcceptableEmail('x@edgehealth.co.uk')?.location_id).toBe(
      'E09000003'
    );
    expect(isAcceptableEmail('x@example.com')).toBeNull();
  });
});

describe('isNonEmptyString', () => {
  it('accepts strings with visible content', () => {
    expect(isNonEmptyString('a')).toBe(true);
    expect(isNonEmptyString('  a  ')).toBe(true);
  });

  it('rejects empty, whitespace and non-strings', () => {
    expect(isNonEmptyString('')).toBe(false);
    expect(isNonEmptyString('   ')).toBe(false);
    expect(isNonEmptyString(null)).toBe(false);
    expect(isNonEmptyString(undefined)).toBe(false);
    expect(isNonEmptyString(0)).toBe(false);
  });
});

describe('validateFormFields', () => {
  it.each(['u:la', 'u:cqc', 'u:x'])('accepts %s', (id) => {
    expect(validateFormFields({ id })).toEqual({});
  });

  it('rejects unknown or missing ids', () => {
    expect(validateFormFields({ id: 'u:admin' })).toEqual({
      id: 'Select an option',
    });
    expect(validateFormFields({ id: '' })).toEqual({ id: 'Select an option' });
  });
});
