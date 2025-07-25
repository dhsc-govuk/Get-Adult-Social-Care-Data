export async function register() {
  if (process.env.NEXT_RUNTIME === 'nodejs') {
    if (process.env.APPLICATIONINSIGHTS_CONNECTION_STRING) {
      console.log('** Application Insights Enabled - Configuring Telemetry **');
      await import('./instrumentation.node');
    } else if (process.env.ENABLE_APM_LOCAL) {
      console.log('** Local APM Enabled - Configuring Telemetry **');
      await import('./instrumentation-local.node.ts')
    } else {
      console.log(
        '** Application Insights Connection String missing - monitoring disabled **'
      );
    }
  }
}