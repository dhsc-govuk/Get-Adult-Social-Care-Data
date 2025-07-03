import appInsights from 'applicationinsights';

class AppInsightsLogger {
  client: appInsights.TelemetryClient | undefined;
  isLocal: boolean = false;
  constructor(instrumentationKey: string) {
    const appInsights = require("applicationinsights");
    if(instrumentationKey && instrumentationKey !== ''){
      this.isLocal = process.env.NEXT_PUBLIC_APP_ENV === 'local';
      if(!this.isLocal){
        if (appInsights) {
          if (!appInsights.defaultClient) {
            appInsights.setup(instrumentationKey)
            // make sure console errors go to azure
            .setAutoCollectConsole(true, true)
            // but don't send debug/warnings to azure
            .setInternalLogging(false, false)
            .start();
          }
          this.client = appInsights.defaultClient;
        }
      }
    }
  }

  logEvent(eventName: string, properties = {}) {
    if(!this.isLocal){
      if(this.client){
        this.client!.trackEvent({ name: eventName, properties });
      }else{
        console.warn("App insights client not initialized.");
      }
    }
  }
}

export default AppInsightsLogger;