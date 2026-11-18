import { CQC_RATINGS } from '@/config/metrics';
import { CQC_SERVICE_TYPE_OPTIONS } from '@/data/cqcMetrics';
import { locations_data } from './locations_data';

const RATINGS = Object.keys(CQC_RATINGS);
const SERVICE_TYPES = CQC_SERVICE_TYPE_OPTIONS.map((option) => option.value);
const LOCATION_NAMES = [
  'Beech Hill',
  'Mill Road',
  'Bales Court',
  'Combe House',
  'Longdown Road',
  'Chandon',
  'Fengates Road',
  'Heathcote Road',
];

const mockLocation = locations_data.care_provider_location;

const PROVIDERS = [
  { code: mockLocation.provider_code, name: mockLocation.provider_name },
  { code: 'testcp3', name: 'Another Care Provider' },
];
const LA_CODES = [mockLocation.local_authority_code, 'testla1'];

// Enough locations for three pages, most recently rated first as the data API
// returns them. Most belong to the mock user's care provider and LA.
const locations = Array.from({ length: 23 }, (_, i) => ({
  code: `1-${100000001 + i}`,
  name: `${i + 1} ${LOCATION_NAMES[i % LOCATION_NAMES.length]}`,
  provider_code: PROVIDERS[i % 4 === 3 ? 1 : 0].code,
  provider_name: PROVIDERS[i % 4 === 3 ? 1 : 0].name,
  la_code: LA_CODES[i % 5 === 4 ? 1 : 0],
  service_types: ['adult_social_care', SERVICE_TYPES[i % SERVICE_TYPES.length]],
  overall_rating: RATINGS[i % RATINGS.length],
  rating_published: `${2026 - Math.floor(i / 2)}-${String(12 - (i % 12)).padStart(2, '0')}-0${(i % 9) + 1}`,
})).sort((a, b) => b.rating_published.localeCompare(a.rating_published));

/** The data API's response for a request's filters, search and page */
export const cqcLocationRatingsResponse = (query: URLSearchParams) => {
  const matches = (param: string, values: (location: any) => string[]) => {
    const chosen = query.getAll(param);
    return (location: any) =>
      !chosen.length || values(location).some((v) => chosen.includes(v));
  };
  const search = (query.get('search') ?? '').toLowerCase();
  const matching = locations
    .filter(matches('la_codes', (l) => [l.la_code]))
    .filter(matches('provider_codes', (l) => [l.provider_code]))
    .filter(matches('service_types', (l) => l.service_types))
    .filter(matches('ratings', (l) => [l.overall_rating]))
    .filter((location) => location.name.toLowerCase().includes(search));

  const pageSize = Number(query.get('page_size')) || matching.length;
  const start = (Number(query.get('page') ?? 1) - 1) * pageSize;
  return {
    data_month: '2026-10-01',
    total: matching.length,
    locations: matching
      .slice(start, start + pageSize)
      .map(({ la_code, ...location }) => location),
  };
};

export const cqc_location_providers = { providers: PROVIDERS };
