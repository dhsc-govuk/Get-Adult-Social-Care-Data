import appInsights from 'applicationinsights';

class AppInsightsLogger {
  client: appInsights.TelemetryClient | undefined;
  isLocal: boolean = false;
  constructor(instrumentationKey: string) {
    console.warn(" instrumentationKey ", instrumentationKey);
    console.log("appInsights: ", appInsights);
    if(instrumentationKey && instrumentationKey !== ''){
      this.isLocal = process.env.NEXT_PUBLIC_APP_ENV === 'local';
      if(!this.isLocal){
        if (appInsights) {
          if (!appInsights.defaultClient) {
            console.log("Setting up AppInsights");
            appInsights.setup(instrumentationKey).start();
          }
          console.log("Getting default client");
          console.log("client: ", this.client);
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