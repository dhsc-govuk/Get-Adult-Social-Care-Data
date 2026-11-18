import { describe, it, expect } from 'vitest';
import { CQC_RATINGS } from '@/config/metrics';
import { CQC_SERVICE_TYPE_OPTIONS } from '@/data/cqcMetrics';
import {
  CQC_LOCATIONS_PAGE_SIZE,
  CQC_LOCATION_COLUMNS,
  CqcLocation,
  LA_FILTER,
  PROVIDER_FILTER,
  RATING_FILTER,
  SERVICE_TYPE_FILTER,
  cqcLocationCsvRows,
  cqcLocationFilterGroups,
  cqcLocationsFilterSummary,
  cqcLocationsQuery,
  cqcServiceTypeLabel,
} from '@/data/cqcLocations';

const groups = cqcLocationFilterGroups(
  [
    { value: 'E1', label: 'Mid Suffolk' },
    { value: 'E2', label: 'Surrey' },
  ],
  [{ value: '1-1', label: 'Achieve Together Limited' }]
);

const location: CqcLocation = {
  code: '1-100',
  name: 'Beech Hill',
  provider_code: '1-1',
  provider_name: 'Achieve Together Limited',
  service_types: ['adult_social_care', 'care_home', 'care_home_residential'],
  overall_rating: 'requires_improvement',
  rating_published: '2026-03-05',
};

describe('cqcLocationFilterGroups', () => {
  it('has the four filters, with the ratings the CQC metrics use', () => {
    expect(groups.map((group) => group.label)).toEqual([
      'Service type',
      'CQC rating',
      'Local authority',
      'Care provider',
    ]);
    expect(groups[0].options.map((option) => option.label)).toEqual(
      CQC_SERVICE_TYPE_OPTIONS.map((option) => option.label)
    );
    expect(groups[1].options.map((option) => option.label)).toEqual(
      Object.values(CQC_RATINGS)
    );
  });
});

describe('cqcLocationsQuery', () => {
  it('asks for every rating when none is chosen, so uninspected locations are left out', () => {
    const query = cqcLocationsQuery({}, '');
    expect(query.getAll(RATING_FILTER)).toEqual(Object.keys(CQC_RATINGS));
    expect(query.has('page_size')).toBe(false);
  });

  it('passes on the chosen filters, the search and the page', () => {
    const query = cqcLocationsQuery(
      {
        [LA_FILTER]: ['E1', 'E2'],
        [PROVIDER_FILTER]: [],
        [SERVICE_TYPE_FILTER]: ['supported_living'],
        [RATING_FILTER]: ['good'],
      },
      ' beech ',
      3
    );
    expect(query.getAll(LA_FILTER)).toEqual(['E1', 'E2']);
    expect(query.has(PROVIDER_FILTER)).toBe(false);
    expect(query.getAll(SERVICE_TYPE_FILTER)).toEqual(['supported_living']);
    expect(query.getAll(RATING_FILTER)).toEqual(['good']);
    expect(query.get('search')).toBe('beech');
    expect(query.get('page')).toBe('3');
    expect(query.get('page_size')).toBe(String(CQC_LOCATIONS_PAGE_SIZE));
  });
});

describe('cqcLocationsFilterSummary', () => {
  it('names a care provider with all service types and ratings', () => {
    expect(
      cqcLocationsFilterSummary(
        groups,
        { [PROVIDER_FILTER]: ['1-1'] },
        '2026-10-01'
      )
    ).toBe(
      'Achieve Together Limited, all service types, all ratings, October 2026'
    );
  });

  it('names every applied filter', () => {
    expect(
      cqcLocationsFilterSummary(
        groups,
        {
          [LA_FILTER]: ['E1', 'E2'],
          [SERVICE_TYPE_FILTER]: ['supported_living'],
          [RATING_FILTER]: ['outstanding', 'good'],
        },
        '2026-10-01'
      )
    ).toBe(
      'Mid Suffolk, Surrey, supported living service, outstanding, good, October 2026'
    );
  });

  it('describes no filters as all locations, without a date until one is known', () => {
    expect(cqcLocationsFilterSummary(groups, {}, undefined)).toBe(
      'all locations, all service types, all ratings'
    );
  });
});

describe('location rows', () => {
  it('shows only the service types a location can be filtered by', () => {
    expect(cqcServiceTypeLabel(location)).toBe(
      'Care home service without nursing'
    );
    expect(
      cqcServiceTypeLabel({ ...location, service_types: ['adult_social_care'] })
    ).toBe('--');
  });

  it('gives the CSV rows the table headings, with the date in full', () => {
    expect(cqcLocationCsvRows([location])).toEqual([
      {
        [CQC_LOCATION_COLUMNS.provider]: 'Achieve Together Limited',
        [CQC_LOCATION_COLUMNS.location]: 'Beech Hill',
        [CQC_LOCATION_COLUMNS.serviceType]: 'Care home service without nursing',
        [CQC_LOCATION_COLUMNS.rating]: 'Requires improvement',
        [CQC_LOCATION_COLUMNS.ratingDate]: '5 March 2026',
      },
    ]);
  });
});
