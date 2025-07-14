export async function register() {
  if (process.env.NEXT_RUNTIME === 'nodejs') {
    if (process.env.APPLICATIONINSIGHTS_CONNECTION_STRING) {
      console.log('** Application Insights Enabled - Configuring Telemetry **');
      await import('./instrumentation.node');
    } else {
      console.log(
        '** Application Insights Connection String missing - monitoring disabled **'
      );
    }
  }
}