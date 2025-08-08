# Logging / Telemetry overview

This application is set up to send usage analytics, logs and telemetry to Azure App Insights, using a combination of:

* OpenTelemetry (via @azure/monitor-opentelemetry)
* Browser Analytics (via @microsoft/applicationinsights-web)
* Winston (https://github.com/winstonjs/winston)

## Configuration

The environment variable `APPLICATIONINSIGHTS_CONNECTION_STRING` needs to be set to the Connection String of the relevant Azure App Insights resource. In production this is handled automatically by the terraform infra repo.

Browser analytics are connected to a separate App Insights resource (as the key is exposed publically). This is
configured via the following environment variable: `WEB_APPLICATIONINSIGHTS_CONNECTION_STRING`.

## HTTP Request telemetry

This is set up in `instrumentation.node.ts` and uses the default http instrumentation provided by `@azure/monitor-opentelemetry` and `@opentelemetry/instrumentation-http`.

Request information is stored in the `requests` table of Azure App Insights.

## Unhandled exceptions

These are handled in the same way as request telemetry, but end up in the `exceptions` table of Azure App Insights.

## Structured application logs

These are handled by a Winston logger, which can be imported in any server side code:

```typescript
import logger from '@/utils/logger';
logger.info("My message", {"foo": "bar"})
```

For client-side code, there is a service and API route which allow authenticated sessions to send logs to the server (and subsequently to Azure):

```typescript
import LogService from '@/services/logger/logService';
LogService.logEvent("The user did something")
```

Application logs can be found in the `traces` table of Azure App Insights.

## Azure Log Analytics

In production, App Insights resources are backed by Azure Log Analytics workspaces, which means that all of the above are also available in the following Log Analytics tables: `AppRequests`, `AppExceptions` and `AppTraces`.

## 🔍 Dashboards & Workbooks

### Shared Dashboards

Shared Azure dashboards used by the team for monitoring metrics and logs are available at the following link:

[Azure Shared Dashboards](https://portal.azure.com/#view/HubsExtension/AssetMenuBlade/~/sharedDashboards/assetName/DashboardHub/extensionName/Microsoft_Azure_PortalDashboard)

These dashboards typically surface key metrics from Application Insights, App Service, and Log Analytics.

### Workbooks

Workbooks provide detailed, interactive views into logs and telemetry from Application Insights.

- **Production Application Insights Workbooks:**  
  https://portal.azure.com/#@DHSCSCDAPAlpha.onmicrosoft.com/resource/subscriptions/<Subscription ID>/resourceGroups/dapalpha-log-analytics-prod-rg/providers/microsoft.insights/components/dapalpha-web-app-insights-<Env>/workbooks

- **Additional Workbooks:**
  [More Resources](https://portal.azure.com/#view/Microsoft_Azure_Monitoring/AzureMonitoringBrowseBlade/~/workbooks) Including MSQL.

> **Note:** Useful workbooks are often linked directly from within the shared dashboards for easier access.

When building out workbooks consider the [Four golden signals](https://sre.google/sre-book/monitoring-distributed-systems/#:~:text=is%20fairly%20useless.-,The%20Four%20Golden%20Signals,-The%20four%20golden)

Microsoft provides a range of [public workbooks](https://github.com/microsoft/Application-Insights-Workbooks/tree/master/Workbooks) templates to adapt.