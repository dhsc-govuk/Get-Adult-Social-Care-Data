import AnalyticsService from '@/services/analytics/analyticsService';
import {
  initializeAppInsights,
  getAppInsights,
} from '@/components/analytics/appInsights';

const TEST_CONNECTION_STRING = 'InstrumentationKey=fake-connection-string';

describe('AnalyticsService', () => {
  it('does not fail if no analytics are set up', () => {
    AnalyticsService.trackMetricView('my-metric');
  });

  it('tracks events with the correct location', () => {
    initializeAppInsights(TEST_CONNECTION_STRING);
    const appInsights = getAppInsights() as any;
    const insightSpy = vi.spyOn(appInsights, 'trackEvent');

    AnalyticsService.trackMetricView('my-metric');

    const expected_event = {
      name: 'metric-view',
      properties: {
        metric_id: 'my-metric',
      },
    };
    expect(insightSpy).toHaveBeenCalledExactlyOnceWith(expected_event);
  });
});
