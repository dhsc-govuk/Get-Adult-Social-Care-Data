// See docs/logging.md for an overview of the telemetry/logging setup
import {
  useAzureMonitor,
  AzureMonitorOpenTelemetryOptions,
} from '@azure/monitor-opentelemetry';
import { resourceFromAttributes } from '@opentelemetry/resources';
import { ATTR_SERVICE_NAME } from '@opentelemetry/semantic-conventions';
import { ATTR_SERVICE_NAMESPACE } from '@opentelemetry/semantic-conventions/incubating';

const customResource = resourceFromAttributes({
  [ATTR_SERVICE_NAME]: 'frontend',
  [ATTR_SERVICE_NAMESPACE]: 'dapalpha',
});

const options: AzureMonitorOpenTelemetryOptions = {
  azureMonitorExporterOptions: {
    connectionString: process.env.APPLICATIONINSIGHTS_CONNECTION_STRING,
  },
  resource: customResource,
  instrumentationOptions: {
    http: { enabled: true },
    winston: { enabled: true },
  },
};
useAzureMonitor(options);
