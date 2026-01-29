import { generateId } from 'better-auth';

export const generateAnalyticsId = () => {
  // Generate a unique ID (e.g., "ua_123456789")
  return 'ua_' + generateId();
};
