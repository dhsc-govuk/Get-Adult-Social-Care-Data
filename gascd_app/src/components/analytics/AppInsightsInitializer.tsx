'use client';

import { useEffect } from 'react';
import { initializeAppInsights } from './appInsights';

interface AppInsightsInitializerProps {
  connectionString: string;
}

export function AppInsightsInitializer({
  connectionString,
}: AppInsightsInitializerProps) {
  useEffect(() => {
    initializeAppInsights(connectionString);
  }, [connectionString]);

  return null; // This component doesn't render anything, it just initializes App Insights
}
