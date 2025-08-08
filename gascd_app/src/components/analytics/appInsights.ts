// Support for in-browser app insights integration
import { ApplicationInsights } from '@microsoft/applicationinsights-web';
import { createBrowserHistory } from 'history';
import LogService from '@/services/logger/logService';

let appInsights: ApplicationInsights | null = null;
let browserHistory: any;

export const initializeAppInsights = (connectionString: string) => {
  if (connectionString && !appInsights) {
    browserHistory = createBrowserHistory();
    appInsights = new ApplicationInsights({
      config: {
        connectionString: connectionString,
        enableAutoRouteTracking: true,
      },
    });
    try {
      appInsights.loadAppInsights();
    } catch (err) {
      // Most likely a connection string issue. Clear the app insights setup and re-throw
      appInsights = null;
      LogService.logEvent('Error loading browser app insights' + err);
      return;
    }

    // Manually track route changes using the history listener
    browserHistory.listen(({ location }: any) => {
      if (appInsights) {
        appInsights.trackPageView({ uri: location.pathname });
      }
    });

    console.log('Application Insights initialized.');
  }
};

export const getAppInsights = (): ApplicationInsights | null => {
  return appInsights;
};
