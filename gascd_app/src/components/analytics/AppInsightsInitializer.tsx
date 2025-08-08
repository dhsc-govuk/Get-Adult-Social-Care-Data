'use client';

import { useEffect } from 'react';
import { initializeAppInsights } from './appInsights';

interface AppInsightsInitializerProps {
  connectionString: string;
}

// Sets up the in-browser app insights integration
export function AppInsightsInitializer({
  connectionString,
}: AppInsightsInitializerProps) {
  useEffect(() => {
    initializeAppInsights(connectionString);
  }, [connectionString]);

  return null;
}
