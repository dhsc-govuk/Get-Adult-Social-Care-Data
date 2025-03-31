import appInsights from 'applicationinsights';

class AppInsightsLogger {
  client: appInsights.TelemetryClient | undefined;
  isLocal: boolean;
  constructor(instrumentationKey: string) {
    this.isLocal = process.env.NEXT_PUBLIC_APP_ENV === 'local';
    if(!this.isLocal){
      if (!appInsights.defaultClient) {
        appInsights.setup(instrumentationKey).start();
      }
      this.client = appInsights.defaultClient;      
    }
  }

  logEvent(eventName: string, properties = {}) {
    if(!this.isLocal){
      this.client!.trackEvent({ name: eventName, properties });
    }
  }
}

export default AppInsightsLogger;