import appInsights from 'applicationinsights';
import AppInsightsLogger from '@/utils/logger';

jest.mock('applicationinsights', () => ({
  setup: jest.fn().mockReturnThis(),
  start: jest.fn(),
  defaultClient: {
    trackException: jest.fn(),
    trackEvent: jest.fn(),
  },
}));

describe('AppInsightsLogger', () => {
  const instrumentationKey = 'dummy-key';
  let logger: AppInsightsLogger;

  beforeEach(() => {
    logger = new AppInsightsLogger(instrumentationKey);
  });

  test('should log an event', () => {
    const eventName = 'Test Event';
    const properties = { key: 'value' };
    logger.logEvent(eventName, properties);

    expect(appInsights.defaultClient.trackEvent).toHaveBeenCalledWith({
      name: eventName,
      properties,
    });
  });
});