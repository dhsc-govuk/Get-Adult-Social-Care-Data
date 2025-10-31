'use client';

import { useEffect } from 'react';
import { initializeAppInsights } from './appInsights';
import Cookies from 'js-cookie';
import { COOKIE_CONSENT_NAME } from '@/constants';

interface AppInsightsInitializerProps {
  connectionString: string;
}

// Sets up the in-browser app insights integration
export function AppInsightsInitializer({
  connectionString,
}: AppInsightsInitializerProps) {
  useEffect(() => {
    if (Cookies.get(COOKIE_CONSENT_NAME) === 'true') {
      initializeAppInsights(connectionString);
    }
  }, [connectionString]);

  return null;
}
