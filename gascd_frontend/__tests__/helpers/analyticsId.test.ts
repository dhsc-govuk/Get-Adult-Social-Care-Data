import { generateAnalyticsId } from '@/helpers/telemetry/analyticsId';

describe('generateAnalyticsId', () => {
  it('should generate a unique analytics ID', () => {
    const analyticsId = generateAnalyticsId();
    expect(analyticsId).toContain('ua_');

    const analyticsId2 = generateAnalyticsId();
    expect(analyticsId2).toContain('ua_');
    expect(analyticsId2).not.toBe(analyticsId);
  });
});
