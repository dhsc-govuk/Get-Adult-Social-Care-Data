import { describe, expect, it } from 'vitest';
import {
  ACCEPTABLE_EMAIL_DOMAINS,
  LA_DOMAIN_LOCATION_MAP,
  getEmailDomain,
  getLocationIdForEmail,
  isAcceptableEmail,
} from '@/lib/domain-check';

// barnet.gov.uk -> E09000003 in scripts/early_access/la_domain_mapping.json
const LA_DOMAIN = 'barnet.gov.uk';
const LA_CODE = 'E09000003';

describe('getEmailDomain', () => {
  it('returns the lowercased domain', () => {
    expect(getEmailDomain(`jane@${LA_DOMAIN}`)).toBe(LA_DOMAIN);
  });

  it('strips casing', () => {
    expect(getEmailDomain('Jane@BARNET.GOV.UK')).toBe(LA_DOMAIN);
  });

  it('strips surrounding whitespace', () => {
    expect(getEmailDomain(`  jane@${LA_DOMAIN}  `)).toBe(LA_DOMAIN);
  });

  it('takes the domain after the last @', () => {
    expect(getEmailDomain(`jane@work@${LA_DOMAIN}`)).toBe(LA_DOMAIN);
  });

  it.each([
    ['no @', 'jane.barnet.gov.uk'],
    ['nothing after @', 'jane@'],
    ['empty', ''],
    ['not a string', 42],
    ['null', null],
    ['undefined', undefined],
  ])('returns null for %s', (_label, input) => {
    expect(getEmailDomain(input)).toBeNull();
  });
});

describe('isAcceptableEmail', () => {
  it.each([
    ['a plain LA address', `jane@${LA_DOMAIN}`],
    ['mixed case', 'Jane.Doe@Barnet.Gov.UK'],
    ['leading and trailing whitespace', `\t jane@${LA_DOMAIN} \n`],
    ['plus-addressing', `jane+gascd@${LA_DOMAIN}`],
  ])('accepts %s', (_label, email) => {
    expect(isAcceptableEmail(email)).toBe(true);
  });

  it.each([
    ['an unknown domain', 'jane@gmail.com'],
    ['a subdomain of an allow-listed domain', `jane@adults.${LA_DOMAIN}`],
    ['a near-miss domain', 'jane@barnet.gov.u'],
    ['a suffix near-miss', 'jane@notbarnet.gov.uk'],
    ['a prefixed near-miss', 'jane@barnet.gov.uk.example.com'],
    ['an empty string', ''],
    ['a non-string', {}],
  ])('rejects %s', (_label, email) => {
    expect(isAcceptableEmail(email)).toBe(false);
  });

  it('does not treat inherited Object properties as allow-listed', () => {
    expect(isAcceptableEmail('jane@constructor')).toBe(false);
    expect(isAcceptableEmail('jane@toString')).toBe(false);
  });
});

describe('getLocationIdForEmail', () => {
  it('maps an allow-listed address to its ONS location code', () => {
    expect(getLocationIdForEmail(`jane@${LA_DOMAIN}`)).toBe(LA_CODE);
  });

  it('maps regardless of casing and whitespace', () => {
    expect(getLocationIdForEmail(' Jane@BARNET.GOV.UK ')).toBe(LA_CODE);
  });

  it('returns null for a domain that is not allow-listed', () => {
    expect(getLocationIdForEmail('jane@gmail.com')).toBeNull();
  });
});

describe('the allow-list itself', () => {
  it('exposes the map keys as the domain list', () => {
    expect(ACCEPTABLE_EMAIL_DOMAINS).toEqual(
      Object.keys(LA_DOMAIN_LOCATION_MAP)
    );
  });

  it('is non-empty and every domain maps to an ONS code', () => {
    expect(ACCEPTABLE_EMAIL_DOMAINS.length).toBeGreaterThan(0);
    for (const domain of ACCEPTABLE_EMAIL_DOMAINS) {
      expect(LA_DOMAIN_LOCATION_MAP[domain]).toMatch(/^E\d{8}$/);
    }
  });

  it('holds every domain already normalised', () => {
    for (const domain of ACCEPTABLE_EMAIL_DOMAINS) {
      expect(domain).toBe(domain.trim().toLowerCase());
    }
  });
});
