import { render } from '@testing-library/react';
import { AppInsightsInitializer } from '@/components/analytics/AppInsightsInitializer';
import { getAppInsights } from '@/components/analytics/appInsights';
import { ApplicationInsights } from '@microsoft/applicationinsights-web';
import LogService from '@/services/logger/logService';

const TEST_CONNECTION_STRING = 'InstrumentationKey=fake-connection-string';

describe('AppInsightsInitializer', () => {
  test('It initialises app insights when called with a valid connection string', () => {
    document.cookie =
      'GASCDConsentGDPR=; expires=Thu, 01 Jan 1970 00:00:00 GMT; path=/';

    render(
      <AppInsightsInitializer connectionString={TEST_CONNECTION_STRING} />
    );

    const insights_no_cookies = getAppInsights();
    expect(insights_no_cookies).toBe(null);

    document.cookie = 'GASCDConsentGDPR=true; path=/';

    const insights_initial = getAppInsights();
    expect(insights_initial).toBe(null);

    render(<AppInsightsInitializer connectionString="" />);

    const insights_blank = getAppInsights();
    expect(insights_blank).toBe(null);

    const logspy = jest.spyOn(LogService, 'logEvent').mockResolvedValue();
    render(<AppInsightsInitializer connectionString="blah" />);
    expect(logspy).toHaveBeenCalledWith(
      'Error loading browser app insightsError: Please provide instrumentation key'
    );
    const insights_invalid = getAppInsights();
    expect(insights_invalid).toBe(null);

    render(
      <AppInsightsInitializer connectionString={TEST_CONNECTION_STRING} />
    );

    const insights = getAppInsights();
    expect(insights).toBeDefined();
    expect(insights).toBeInstanceOf(ApplicationInsights);
    expect(insights?.config.connectionString).toBe(TEST_CONNECTION_STRING);
  });
});
