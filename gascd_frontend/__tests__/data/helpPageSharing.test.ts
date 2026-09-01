import fs from 'fs';
import path from 'path';
import {
  HELP_PAGE_SHARING,
  SHARING_REASONS,
  getSharingForHelpPage,
} from '@/data/sharingCategories';

const HELP_DIR = path.join(process.cwd(), 'app', '(protected)', 'help');

// Details pages that deliberately carry no sharing label
const NOT_AN_INDICATOR = ['smart-insights'];

const helpPageSlugs = fs
  .readdirSync(HELP_DIR, { withFileTypes: true })
  .filter((entry) => entry.isDirectory())
  .map((entry) => entry.name)
  .filter((slug) => !NOT_AN_INDICATOR.includes(slug));

describe('help page sharing registry', () => {
  it('covers every data indicator details page', () => {
    const missing = helpPageSlugs.filter(
      (slug) => !(slug in HELP_PAGE_SHARING)
    );
    expect(
      missing,
      `these details pages would render without a sharing label: ${missing.join(', ')}`
    ).toEqual([]);
  });

  it('does not hold entries for pages that no longer exist', () => {
    const stale = Object.keys(HELP_PAGE_SHARING).filter(
      (slug) => !helpPageSlugs.includes(slug)
    );
    expect(stale, `stale entries: ${stale.join(', ')}`).toEqual([]);
  });

  it('only references reasons that exist', () => {
    Object.entries(HELP_PAGE_SHARING).forEach(([slug, reasonKey]) => {
      expect(
        SHARING_REASONS[reasonKey],
        `bad reason for ${slug}`
      ).toBeDefined();
    });
  });
});

describe('getSharingForHelpPage', () => {
  it('resolves a page to its category and reasoning', () => {
    const result = getSharingForHelpPage('/help/percentage-beds-occupied');
    expect(result?.category.label).toBe('Not for sharing externally');
    expect(result?.reasoning).toBe(
      SHARING_REASONS.capacityTrackerRestricted.text
    );
  });

  it('ignores a configured base path', () => {
    expect(
      getSharingForHelpPage('/some-base/help/population-size')?.category.id
    ).toBe('published');
  });

  it('returns nothing for an unknown or empty path', () => {
    const warn = vi.spyOn(console, 'warn').mockImplementation(() => {});
    expect(getSharingForHelpPage('/help/nope')).toBeUndefined();
    expect(getSharingForHelpPage('')).toBeUndefined();
    expect(getSharingForHelpPage(null)).toBeUndefined();
    warn.mockRestore();
  });
});

describe('sharing reasons', () => {
  it('each reason fixes its own category, so the two cannot disagree', () => {
    expect(SHARING_REASONS.publicDomain.category).toBe('published');
    expect(SHARING_REASONS.capacityTrackerRestricted.category).toBe(
      'not-for-external-sharing'
    );
    expect(SHARING_REASONS.capacityTrackerOwnOrganisation.category).toBe(
      'discretion'
    );
    expect(SHARING_REASONS.poppiPansiRestricted.category).toBe(
      'not-for-external-sharing'
    );
  });
});
