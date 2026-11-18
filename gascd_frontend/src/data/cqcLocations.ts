/**
 * The list of adult social care locations with their CQC rating: its filters,
 * labels and the request made for it. The ratings and their colours are the
 * ones the CQC ratings metrics use, from `@/data/cqcMetrics`.
 */

import { components } from '@/metrics-api-schema';
import { CQC_RATINGS, CqcRatingId } from '@/config/metrics';
import { FilterGroup, FilterSelection } from '@/components/filters/FilterPanel';
import {
  CQC_SERVICE_TYPE_FILTER_GROUP,
  CQC_SERVICE_TYPE_OPTIONS,
} from '@/data/cqcMetrics';
import IndicatorService from '@/services/indicator/IndicatorService';

export type CqcLocation = components['schemas']['CqcLocation'];
export type CqcLocationRatings =
  components['schemas']['CqcLocationRatingsResponse'];
export type CqcLocationProvider = components['schemas']['CqcLocationProvider'];

// The filters' ids are the names of the API's query parameters
export const SERVICE_TYPE_FILTER = CQC_SERVICE_TYPE_FILTER_GROUP.id;
export const RATING_FILTER = 'ratings';
export const LA_FILTER = 'la_codes';
export const PROVIDER_FILTER = 'provider_codes';

export const CQC_LOCATIONS_PAGE_SIZE = 10;

export const CQC_LOCATIONS_HELP_URL =
  '/help/cqc-ratings-and-dates-of-latest-inspection-of-adult-social-care-locations';

type Option = { value: string; label: string };

const options = (labels: Record<string, string>): Option[] =>
  Object.entries(labels).map(([value, label]) => ({ value, label }));

/** The four filters, in the order shown */
export const cqcLocationFilterGroups = (
  localAuthorities: Option[],
  providers: Option[]
): FilterGroup[] => [
  CQC_SERVICE_TYPE_FILTER_GROUP,
  {
    id: RATING_FILTER,
    label: 'CQC rating',
    allLabel: 'All ratings',
    options: options(CQC_RATINGS),
  },
  {
    id: LA_FILTER,
    label: 'Local authority',
    allLabel: 'All local authorities',
    options: localAuthorities,
  },
  {
    id: PROVIDER_FILTER,
    label: 'Care provider',
    allLabel: 'All care providers',
    options: providers,
  },
];

/**
 * The query for the locations matching the filters and search: one page of
 * them, or all of them when no page is given.
 */
export const cqcLocationsQuery = (
  filters: FilterSelection,
  search: string,
  page?: number
): URLSearchParams => {
  const query = new URLSearchParams();
  Object.entries(filters).forEach(([filter, values]) =>
    values.forEach((value) => query.append(filter, value))
  );
  // The list is of inspected locations, so "All ratings" is every rating
  // rather than no filter, which would add the locations not yet inspected
  if (!filters[RATING_FILTER]?.length) {
    Object.keys(CQC_RATINGS).forEach((rating) =>
      query.append(RATING_FILTER, rating)
    );
  }
  if (search.trim()) query.set('search', search.trim());
  if (page) {
    query.set('page', String(page));
    query.set('page_size', String(CQC_LOCATIONS_PAGE_SIZE));
  }
  return query;
};

/**
 * What the table is filtered to, for its title: the chosen local authorities
 * and care providers (or all locations), service types, ratings and the month
 * of the data.
 */
export const cqcLocationsFilterSummary = (
  groups: FilterGroup[],
  filters: FilterSelection,
  dataMonth: string | null | undefined
): string => {
  const chosen = (groupId: string): string[] => {
    const group = groups.find(({ id }) => id === groupId);
    return (filters[groupId] ?? []).map(
      (value) =>
        group?.options.find((option) => option.value === value)?.label ?? value
    );
  };
  const places = [...chosen(LA_FILTER), ...chosen(PROVIDER_FILTER)];
  const serviceTypes = chosen(SERVICE_TYPE_FILTER).map((label) =>
    label.toLowerCase()
  );
  const ratings = chosen(RATING_FILTER).map((label) => label.toLowerCase());

  return [
    places.length ? places.join(', ') : 'all locations',
    serviceTypes.length ? serviceTypes.join(', ') : 'all service types',
    ratings.length ? ratings.join(', ') : 'all ratings',
    ...(dataMonth ? [formatDataMonth(dataMonth)] : []),
  ].join(', ');
};

/** The month of the data, for example October 2026 */
export const formatDataMonth = (dataMonth: string): string =>
  new Intl.DateTimeFormat('en-GB', { month: 'long', year: 'numeric' }).format(
    new Date(dataMonth)
  );

export const cqcRatingLabel = (location: CqcLocation): string =>
  CQC_RATINGS[location.overall_rating as CqcRatingId] ?? '--';

/** The date in full, for example 5 March 2026 */
export const cqcRatingDate = (location: CqcLocation): string =>
  location.rating_published
    ? IndicatorService.formatDate(location.rating_published)
    : '--';

/** The location's service types that it can be filtered by */
export const cqcServiceTypeLabel = (location: CqcLocation): string =>
  CQC_SERVICE_TYPE_OPTIONS.filter((option) =>
    location.service_types?.includes(option.value)
  )
    .map((option) => option.label)
    .join(', ') || '--';

export const CQC_LOCATION_COLUMNS = {
  provider: 'Provider',
  location: 'Location',
  serviceType: 'Service type',
  rating: 'Overall CQC rating',
  ratingDate: 'Date of latest CQC rating publication',
};

/** The locations as the rows of the CSV download, under the table's headings */
export const cqcLocationCsvRows = (
  locations: CqcLocation[]
): Record<string, string>[] =>
  locations.map((location) => ({
    [CQC_LOCATION_COLUMNS.provider]: location.provider_name ?? '',
    [CQC_LOCATION_COLUMNS.location]: location.name ?? '',
    [CQC_LOCATION_COLUMNS.serviceType]: cqcServiceTypeLabel(location),
    [CQC_LOCATION_COLUMNS.rating]: cqcRatingLabel(location),
    [CQC_LOCATION_COLUMNS.ratingDate]: cqcRatingDate(location),
  }));
