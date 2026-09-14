import fs from 'node:fs';
import path from 'node:path';
import {
  ACCEPTABLE_EMAIL_DOMAINS,
  LA_EMAIL_DOMAIN_ID_MAP,
  isAcceptableEmail,
  isNonEmptyString,
  parseEmail,
  validateFormFields,
} from '@/lib/domain-check';

const DEV_URL = 'https://dev.analytics.dhsc.gov.uk/gascd-frontend-dev';
const PROD_URL = 'https://analytics.dhsc.gov.uk/gascd-frontend';

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
});

describe('parseEmail', () => {
  it('returns the ONS code for a listed council domain', () => {
    expect(parseEmail('officer@barnet.gov.uk', false)).toEqual({
      domain: 'barnet.gov.uk',
      location_id: 'E09000003',
      email: 'officer@barnet.gov.uk',
    });
  });

  it('is case-insensitive on the domain', () => {
    expect(parseEmail('Officer@Barnet.GOV.UK', false)?.location_id).toBe(
      'E09000003'
    );
  });

  it('rejects an unlisted domain', () => {
    expect(parseEmail('someone@example.com', false)).toBeNull();
  });

  it('rejects a subdomain of a listed domain', () => {
    expect(parseEmail('someone@mail.barnet.gov.uk', false)).toBeNull();
  });

  it('rejects a value with no domain part', () => {
    expect(parseEmail('not-an-email', false)).toBeNull();
    expect(parseEmail('', false)).toBeNull();
  });

  it('rejects a value with more than one @', () => {
    expect(parseEmail('a@b@barnet.gov.uk', false)).toBeNull();
  });

  describe('internal test domains', () => {
    const internal = ['dhsc.gov.uk', 'edgehealth.co.uk', 'deloitte.co.uk'];

    it.each(internal)('accepts %s only when isDev is true', (domain) => {
      expect(parseEmail(`tester@${domain}`, true)).not.toBeNull();
      expect(parseEmail(`tester@${domain}`, false)).toBeNull();
    });

    it('does not leak internal domains into the public allowlist', () => {
      for (const domain of internal) {
        expect(ACCEPTABLE_EMAIL_DOMAINS).not.toContain(domain);
      }
    });
  });
});

describe('isAcceptableEmail', () => {
  it('returns null for non-string input', () => {
    expect(isAcceptableEmail(undefined, PROD_URL)).toBeNull();
    expect(isAcceptableEmail(null, PROD_URL)).toBeNull();
    expect(isAcceptableEmail(42, PROD_URL)).toBeNull();
    expect(
      isAcceptableEmail({ email: 'x@barnet.gov.uk' }, PROD_URL)
    ).toBeNull();
  });

  it('accepts a council address regardless of environment', () => {
    expect(isAcceptableEmail('x@barnet.gov.uk', PROD_URL)).not.toBeNull();
    expect(isAcceptableEmail('x@barnet.gov.uk', DEV_URL)).not.toBeNull();
    expect(isAcceptableEmail('x@barnet.gov.uk', null)).not.toBeNull();
  });

  it('only accepts internal domains under the dev URL', () => {
    expect(isAcceptableEmail('x@edgehealth.co.uk', DEV_URL)).not.toBeNull();
    expect(isAcceptableEmail('x@edgehealth.co.uk', PROD_URL)).toBeNull();
    expect(isAcceptableEmail('x@edgehealth.co.uk', null)).toBeNull();
    expect(isAcceptableEmail('x@edgehealth.co.uk', '')).toBeNull();
  });

  it('does not treat a look-alike host as dev', () => {
    expect(
      isAcceptableEmail(
        'x@edgehealth.co.uk',
        'https://dev.analytics.dhsc.gov.uk.evil.example'
      )
    ).toBeNull();
    expect(
      isAcceptableEmail(
        'x@edgehealth.co.uk',
        'http://dev.analytics.dhsc.gov.uk'
      )
    ).toBeNull();
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
