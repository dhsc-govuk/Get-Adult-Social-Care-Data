import { getAppInsights } from '@/components/analytics/appInsights';
import { METRIC_VIEW_EVENT } from '@/constants';
import { ICustomProperties } from '@microsoft/applicationinsights-web';

class AnalyticsService {
  // Note - user properties are added to all events inside the analytics init method
  public static async trackMetricView(metric_id: string) {
    // Tracks the event of (any) metrics being viewed
    // (location is added via the user's selected location)
    const appInsights = getAppInsights();
    if (appInsights) {
      let props: ICustomProperties = {
        metric_id: metric_id,
      };
      appInsights.trackEvent({ name: METRIC_VIEW_EVENT, properties: props });
    }
  }
}
export default AnalyticsService;
