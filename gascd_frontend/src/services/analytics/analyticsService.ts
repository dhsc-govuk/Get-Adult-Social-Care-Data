import { getAppInsights } from '@/components/analytics/appInsights';
import {
  LOCATION_CHANGE_EVENT,
  METRIC_VIEW_EVENT,
  DATA_TAB_CHANGE_EVENT,
  MPS_LINK_EVENT,
} from '@/constants';
import { ICustomProperties } from '@microsoft/applicationinsights-web';

class AnalyticsService {
  // Note - user properties are added to all events inside the analytics init method

  private static _track(event_name: string, props: ICustomProperties) {
    const appInsights = getAppInsights();
    if (!appInsights) {
      // Opted out - ignore
      return;
    } else {
      appInsights.trackEvent({ name: event_name, properties: props });
    }
  }

  public static trackMetricView(metric_id: string) {
    // Tracks the event of (any) metrics being viewed
    // (location is added via the user's selected location)
    this._track(METRIC_VIEW_EVENT, {
      metric_id: metric_id,
    });
  }

  public static trackLocationChange(location_id_new: string) {
    this._track(LOCATION_CHANGE_EVENT, {
      location_id: location_id_new,
    });
  }

  public static trackDataTabChange(tabname: string) {
    this._track(DATA_TAB_CHANGE_EVENT, {
      tabname: tabname,
    });
  }

  public static trackMPSClicked(local_authority_id: string) {
    this._track(MPS_LINK_EVENT, {
      local_authority_id: local_authority_id,
    });
  }
}
export default AnalyticsService;
