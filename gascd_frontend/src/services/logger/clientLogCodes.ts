// Allowlist of codes the browser may send to the /api/logger endpoint.
// The client never sends free text; the server maps each code to a fixed
// message (see app/api/logger/route.ts). This prevents log injection (CWE-117).
export enum ClientLogCode {
  LocationFetchFailed = 'LOCATION_FETCH_FAILED',
  AvailableLocationsFetchFailed = 'AVAILABLE_LOCATIONS_FETCH_FAILED',
  SetSelectedLocationFailed = 'SET_SELECTED_LOCATION_FAILED',
  LasForRegionFetchFailed = 'LAS_FOR_REGION_FETCH_FAILED',
  AppInsightsInitFailed = 'APP_INSIGHTS_INIT_FAILED',
}
