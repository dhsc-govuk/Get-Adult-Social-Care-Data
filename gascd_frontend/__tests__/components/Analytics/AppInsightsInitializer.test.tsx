import { render } from '@testing-library/react';
import { AppInsightsInitializer } from '@/components/analytics/AppInsightsInitializer';
import {
  getAppInsights,
  resetAppInsights,
} from '@/components/analytics/appInsights';
import { ApplicationInsights } from '@microsoft/applicationinsights-web';
import LogService from '@/services/logger/logService';
import { mockSession, mockSessionWithAnalytics } from '@/test-utils/test-utils';

const TEST_CONNECTION_STRING = 'InstrumentationKey=fake-connection-string';

describe('AppInsightsInitializer', () => {
  beforeEach(() => {
    resetAppInsights();
  });

  test('It initialises app insights when called with a valid connection string', () => {
    document.cookie = 'GASCDConsentGDPR=true; path=/';

    render(
      <AppInsightsInitializer connectionString={TEST_CONNECTION_STRING} />
    );

    const insights = getAppInsights();
    expect(insights).toBeDefined();
    expect(insights).toBeInstanceOf(ApplicationInsights);
    expect(insights?.config.connectionString).toBe(TEST_CONNECTION_STRING);
  });

  test('It does not initialises app insights when called with an invalid connection string', () => {
    document.cookie = 'GASCDConsentGDPR=true; path=/';

    const logspy = vi.spyOn(LogService, 'logEvent').mockResolvedValue();

    render(<AppInsightsInitializer connectionString="blah" />);

    expect(logspy).toHaveBeenCalledWith(
      'Error loading browser app insightsError: Please provide instrumentation key'
    );

    const insights_invalid = getAppInsights();
    expect(insights_invalid).toBe(null);
  });

  test('It does not initialises app insights when called with no connection string', () => {
    document.cookie = 'GASCDConsentGDPR=true; path=/';

    render(<AppInsightsInitializer connectionString="" />);

    const insights_blank = getAppInsights();
    expect(insights_blank).toBe(null);
  });

  test('It does not initialises app insights when called with no cookie consent', () => {
    document.cookie =
      'GASCDConsentGDPR=; expires=Thu, 01 Jan 1970 00:00:00 GMT; path=/';

    render(
      <AppInsightsInitializer connectionString={TEST_CONNECTION_STRING} />
    );

    const insights = getAppInsights();
    expect(insights).toBe(null);
  });

  test('It does not initialises app insights when called with cookie consent set to false', () => {
    document.cookie = 'GASCDConsentGDPR=false;';

    render(
      <AppInsightsInitializer connectionString={TEST_CONNECTION_STRING} />
    );

    const insights = getAppInsights();
    expect(insights).toBe(null);
  });

  test('It pulls the analytics userid from the session', () => {
    document.cookie = 'GASCDConsentGDPR=true;';
    render(
      <AppInsightsInitializer
        connectionString={TEST_CONNECTION_STRING}
        session={mockSessionWithAnalytics}
      />
    );

    const insights = getAppInsights();
    expect(insights).toBeDefined();
    expect(insights).toBeInstanceOf(ApplicationInsights);
    expect(insights?.context.user.authenticatedId).toBe(
      mockSessionWithAnalytics.user.analyticsId
    );
  });

  test('It has no userid if no session provided', () => {
    document.cookie = 'GASCDConsentGDPR=true;';
    render(
      <AppInsightsInitializer connectionString={TEST_CONNECTION_STRING} />
    );

    const insights = getAppInsights();
    expect(insights).toBeDefined();
    expect(insights).toBeInstanceOf(ApplicationInsights);
    expect(insights?.context.user.authenticatedId).toBe(undefined);
  });
});
