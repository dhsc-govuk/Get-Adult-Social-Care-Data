import React, {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
import DataBox from '@/components/data-components/DataBox';
import DataTabs from '@/components/data-components/DataTabs';
import SectionControls from '@/components/data-components/SectionControls';
import SearchForm from '@/components/data-components/SearchForm';
import FilterPanel, { FilterSelection } from '@/components/filters/FilterPanel';
import Pagination from '@/components/common/pagination/Pagination';
import CqcLocationsTable from '@/components/tables/CqcLocationsTable';
import DownloadTableDataCSVLink from '@/components/metric-components/download-table-data-csv-link/DownloadTableDataCSVLink';
import { useAllLocalAuthorities } from '@/components/charts/peer-group/useAllLocalAuthorities';
import AnalyticsService from '@/services/analytics/analyticsService';
import LocationService from '@/services/location/locationService';
import CqcLocationService from '@/services/cqc-locations/cqcLocationService';
import { Locations } from '@/data/interfaces/Locations';
import { SOURCES } from '@/config/metrics';
import { NUM_CQC_INSPECTED_LOCATIONS } from '@/data/cqcMetrics';
import {
  CQC_LOCATIONS_PAGE_SIZE,
  CqcLocationProvider,
  CqcLocationRatings,
  LA_FILTER,
  PROVIDER_FILTER,
  cqcLocationCsvRows,
  cqcLocationFilterGroups,
  cqcLocationsFilterSummary,
  cqcLocationsQuery,
} from '@/data/cqcLocations';

type Props = {
  // Tab ids: table-<id>, download-<id>
  id: string;
  title: React.ReactNode;
  intro: React.ReactNode;
  tableNumber: number;
  download: { filename: string; description: string };
};

// What the user has chosen to see, kept for the session
type View = { filters: FilterSelection; search: string; page: number };

// The name the view is stored and the filters are tracked under
const CQC_LOCATIONS = 'cqc_location_ratings';
const TABLE_TITLE =
  'CQC ratings and date of latest inspection of adult social care locations';

// A care provider user starts with their own care company's locations, a
// local authority user with the locations in their LA
const defaultFilters = (location: Locations): FilterSelection =>
  location.provider_id
    ? { [PROVIDER_FILTER]: [location.provider_id] }
    : { [LA_FILTER]: location.la_code ? [location.la_code] : [] };

/**
 * A searchable, filtered list of adult social care locations with their CQC
 * rating, as a table and a download of every location that the filters and search
 * of the table match.
 */
const CqcLocationsSection: React.FC<Props> = ({
  id,
  title,
  intro,
  tableNumber,
  download,
}) => {
  const titleRef = useRef<HTMLParagraphElement>(null);
  const [userLocation, setUserLocation] = useState<Locations>();
  const [providers, setProviders] = useState<CqcLocationProvider[]>([]);
  const [providersFailed, setProvidersFailed] = useState(false);
  const { authorities, error: authoritiesFailed } =
    useAllLocalAuthorities(true);
  const [view, setView] = useState<View>();
  const [result, setResult] = useState<CqcLocationRatings>();
  const [error, setError] = useState(false);

  useEffect(() => {
    AnalyticsService.trackMetricView(CQC_LOCATIONS);

    CqcLocationService.getProviders()
      .then(setProviders)
      .catch((error) => {
        console.error('Error fetching providers:', error);
        setProvidersFailed(true);
      });

    LocationService.getLocations('')
      .then((location) => {
        setUserLocation(location);
        const stored = sessionStorage.getItem(CQC_LOCATIONS);
        setView(
          stored
            ? JSON.parse(stored)
            : { filters: defaultFilters(location), search: '', page: 1 }
        );
      })
      .catch((error) => {
        console.error('Error fetching location:', error);
        setError(true);
      });
  }, []);

  useEffect(() => {
    if (!view) return;
    let cancelled = false;
    setError(false);
    CqcLocationService.getLocations(
      cqcLocationsQuery(view.filters, view.search, view.page)
    )
      .then((data) => {
        if (!cancelled) setResult(data);
      })
      .catch((error) => {
        if (cancelled) return;
        console.error('Error fetching CQC locations:', error);
        setError(true);
      });
    return () => {
      cancelled = true;
    };
  }, [view]);

  const updateView = (changes: Partial<View>) => {
    if (!view) return;
    // Changing the filters or search returns to the first page
    const next = { ...view, page: 1, ...changes };
    sessionStorage.setItem(CQC_LOCATIONS, JSON.stringify(next));
    setView(next);
  };

  // Until the full lists load, the user's own LA and care company are the
  // options, so the default filter can always be named
  const groups = useMemo(
    () =>
      cqcLocationFilterGroups(
        authorities?.map((la) => ({ value: la.laCode, label: la.laName })) ??
          (userLocation?.la_code
            ? [{ value: userLocation.la_code, label: userLocation.la_name }]
            : []),
        providers.length
          ? providers.map((provider) => ({
              value: provider.code ?? '',
              label: provider.name ?? '',
            }))
          : userLocation?.provider_id
            ? [
                {
                  value: userLocation.provider_id,
                  label: userLocation.provider_name,
                },
              ]
            : []
      ),
    [authorities, providers, userLocation]
  );

  // The locations can still be listed without them, filtered by the rest
  const failedFilterLists = [
    ...(authoritiesFailed ? ['local authorities'] : []),
    ...(providersFailed ? ['care providers'] : []),
  ];

  const tableTitle = view
    ? `${TABLE_TITLE} – ${cqcLocationsFilterSummary(groups, view.filters, result?.data_month)}`
    : TABLE_TITLE;
  const total = result?.total ?? 0;
  const totalPages = Math.ceil(total / CQC_LOCATIONS_PAGE_SIZE);

  // The names of the first locations matching the text typed, within the
  // applied filters
  const filters = view?.filters;
  const suggestLocations = useCallback(
    async (term: string) => {
      const matches = await CqcLocationService.getLocations(
        cqcLocationsQuery(filters ?? {}, term, 1)
      );
      const names = (matches.locations ?? []).map(({ name }) => name ?? '');
      return Array.from(new Set(names));
    },
    [filters]
  );

  // Shown in place of the table and the download when there is nothing to show
  const unavailable = () => {
    if (error) {
      return (
        <p className="govuk-body">
          The locations could not be loaded. Try again later.
        </p>
      );
    }
    if (!view || !result) return <p className="govuk-body">Loading...</p>;
    if (total === 0) {
      return (
        <p className="govuk-body">
          No locations match your {view.search ? 'search' : 'filters'}. You can
          change your search or filters.
        </p>
      );
    }
    return null;
  };

  return (
    <DataBox dataTitle={title} dataInfo={intro}>
      <DataTabs
        id={id}
        sharingMetricIds={[NUM_CQC_INSPECTED_LOCATIONS]}
        table={
          <>
            {view && (
              <>
                <SectionControls
                  filters={
                    <FilterPanel
                      idPrefix={`cqc-locations-filters-${id}`}
                      filterType={CQC_LOCATIONS}
                      groups={groups}
                      applied={view.filters}
                      onApply={(filters) => updateView({ filters })}
                    />
                  }
                />
                {failedFilterLists.length > 0 && (
                  <p className="govuk-body">
                    The {failedFilterLists.length > 1 ? 'lists' : 'list'} of{' '}
                    {failedFilterLists.join(' and ')} for the filters could not
                    be loaded. Try again later.
                  </p>
                )}
                <p
                  id={`cqc-locations-title-${id}`}
                  ref={titleRef}
                  tabIndex={-1}
                  className="govuk-body govuk-!-font-weight-bold"
                >
                  Table {tableNumber}: {tableTitle}
                </p>
                <SearchForm
                  inputId={`cqc-locations-search-${id}`}
                  label="Search by location name"
                  hint="Start typing, for example Beech Hill"
                  value={view.search}
                  onSearch={(search) => updateView({ search })}
                  suggest={suggestLocations}
                />
              </>
            )}
            {unavailable() ??
              (view && result && (
                <>
                  <CqcLocationsTable
                    titleId={`cqc-locations-title-${id}`}
                    locations={result.locations ?? []}
                  />
                  {totalPages > 1 && (
                    <Pagination
                      currentPage={view.page}
                      totalPages={totalPages}
                      pageHref={() => '#'}
                      onPageChange={(page) => {
                        updateView({ page });
                        // The link selected may not be on the next page
                        titleRef.current?.focus();
                      }}
                    />
                  )}
                  <p className="govuk-body govuk-!-margin-bottom-0">
                    Source: {SOURCES.cqcCareDirectory}
                  </p>
                </>
              ))}
            <div className="govuk-visually-hidden" role="status">
              {view && result && !error
                ? `${total.toLocaleString('en-GB')} ${total === 1 ? 'location' : 'locations'} found${totalPages > 1 ? `, showing page ${view.page} of ${totalPages}` : ''}`
                : ''}
            </div>
          </>
        }
        download={
          // Every location the filters and search of the table match, not
          // only the page shown
          <>
            {unavailable() ??
              (view && (
                <DownloadTableDataCSVLink
                  fetchRawData={async () =>
                    cqcLocationCsvRows(
                      (
                        await CqcLocationService.getLocations(
                          cqcLocationsQuery(view.filters, view.search)
                        )
                      ).locations ?? []
                    )
                  }
                  notes={[
                    tableTitle,
                    ...(view.search
                      ? [`Location name search: ${view.search}`]
                      : []),
                    `Source: ${SOURCES.cqcCareDirectory}`,
                  ]}
                  filename={download.filename}
                  xLabel=""
                  downloadType={download.description}
                />
              ))}
          </>
        }
      />
    </DataBox>
  );
};

export default CqcLocationsSection;
