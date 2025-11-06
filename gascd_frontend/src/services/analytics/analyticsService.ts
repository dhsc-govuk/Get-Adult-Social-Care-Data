import { getAppInsights } from "@/components/analytics/appInsights";
import { ACTIVE_LOCATION_ID, LOCATION_METRICS_VIEW_EVENT } from "@/constants";
import { ICustomProperties } from "@microsoft/applicationinsights-web";

class AnalyticsService {

  public static async trackMetricLocationView(locationId: string) {
    // Tracks the event of (any) metrics being viewed at a specific location id
    const appInsights = getAppInsights();
    if (appInsights) {
        let props: ICustomProperties = {};
        props[ACTIVE_LOCATION_ID] = locationId;
        appInsights.trackEvent({name: LOCATION_METRICS_VIEW_EVENT, properties: props});
        console.log(LOCATION_METRICS_VIEW_EVENT);
    }
  }
}
export default AnalyticsService;

