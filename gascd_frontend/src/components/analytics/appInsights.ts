// Support for in-browser app insights integration
import {
  ApplicationInsights,
  ITelemetryItem,
} from '@microsoft/applicationinsights-web';
import { createBrowserHistory } from 'history';
import { ReactPlugin } from '@microsoft/applicationinsights-react-js';
import LogService from '@/services/logger/logService';
import { Session } from '@/utils/auth-client';
import { PRIMARY_LOCATION_ID, PRIMARY_LOCATION_TYPE } from '@/constants';

let appInsights: ApplicationInsights | null = null;
let browserHistory: any;
let reactPlugin = new ReactPlugin();

export const initializeAppInsights = (
  connectionString: string,
  session?: Session | null
) => {
  if (connectionString && !appInsights) {
    browserHistory = createBrowserHistory();
    appInsights = new ApplicationInsights({
      config: {
        connectionString: connectionString,
        extensions: [reactPlugin],
        extensionConfig: {
          [reactPlugin.identifier]: { history: browserHistory },
        },
      },
    });
    try {
      appInsights.loadAppInsights();
      if (session?.user?.id) {
        appInsights.setAuthenticatedUserContext(session.user.id);
        // Custom telemetry method to add user properties to all analytics
        var telemetryInitializer = (envelope: ITelemetryItem) => {
          if (envelope.data) {
            envelope.data[PRIMARY_LOCATION_ID] = session.user.locationId;
            envelope.data[PRIMARY_LOCATION_TYPE] = session.user.locationType;
          }
        };
        appInsights.addTelemetryInitializer(telemetryInitializer);
      }
    } catch (err) {
      // Most likely a connection string issue. Clear the app insights setup and re-throw
      appInsights = null;
      LogService.logEvent('Error loading browser app insights' + err);
      return;
    }
    console.log('Application Insights initialized.');
  }
};

export const getAppInsights = (): ApplicationInsights | null => {
  return appInsights;
};

export const resetAppInsights = () => {
  appInsights = null;
};
