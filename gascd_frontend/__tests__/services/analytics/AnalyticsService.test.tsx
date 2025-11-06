import AnalyticsService from "@/services/analytics/analyticsService";
import { initializeAppInsights, getAppInsights } from "@/components/analytics/appInsights";

const TEST_CONNECTION_STRING = 'InstrumentationKey=fake-connection-string';

describe('AnalyticsService', () => {
  it('does not fail if no analytics are set up', () => {
    AnalyticsService.trackMetricLocationView("mylocationid");
  });

  it('tracks events with the correct location', () => {
    initializeAppInsights(TEST_CONNECTION_STRING);
    const appInsights = getAppInsights() as any;
    const insightSpy = vi.spyOn(appInsights, 'trackEvent')

    AnalyticsService.trackMetricLocationView("mylocationid");

    const expected_event = {
     "name": "location_metrics_view",
     "properties": {
        "activeLocationId": "mylocationid",
     },
    }
    expect(insightSpy).toHaveBeenCalledExactlyOnceWith(expected_event);
  });

});
