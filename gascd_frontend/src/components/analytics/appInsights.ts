// Support for in-browser app insights integration
import {
  ApplicationInsights,
  ITelemetryItem,
} from '@microsoft/applicationinsights-web';
import { createBrowserHistory } from 'history';
import { ReactPlugin } from '@microsoft/applicationinsights-react-js';
import LogService from '@/services/logger/logService';
import { ClientLogCode } from '@/services/logger/clientLogCodes';
import { Session } from '@/lib/auth-client';
import {
  PRIMARY_LOCATION_ID,
  PRIMARY_LOCATION_TYPE,
  ACTIVE_LOCATION_ID,
  USER_EMAIL_HASH,
} from '@/constants';
import crypto from 'crypto';

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
      if (session?.user?.analyticsId) {
        appInsights.setAuthenticatedUserContext(session.user.analyticsId);
        // Custom telemetry method to add user properties to all analytics
        var telemetryInitializer = (envelope: ITelemetryItem) => {
          if (envelope.data) {
            envelope.data[PRIMARY_LOCATION_ID] = session.user.locationId;
            envelope.data[PRIMARY_LOCATION_TYPE] = session.user.locationType;
            envelope.data[ACTIVE_LOCATION_ID] = session.user.selectedLocationId;
          }
        };
        appInsights.addTelemetryInitializer(telemetryInitializer);
      }
    } catch {
      // Most likely a connection string issue. Clear the app insights setup.
      appInsights = null;
      LogService.logEvent(ClientLogCode.AppInsightsInitFailed);
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
