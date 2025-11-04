'use client';

import { useEffect } from 'react';
import { initializeAppInsights } from './appInsights';
import Cookies from 'js-cookie';
import { COOKIE_CONSENT_NAME } from '@/constants';
import { Session } from 'next-auth';
interface AppInsightsInitializerProps {
  connectionString: string;
  session?: Session | null;
}

// Sets up the in-browser app insights integration
export function AppInsightsInitializer({
  connectionString,
  session,
}: AppInsightsInitializerProps) {
  useEffect(() => {
    if (Cookies.get(COOKIE_CONSENT_NAME) === 'true') {
      initializeAppInsights(connectionString, session);
    }
  }, [connectionString]);

  return null;
}
