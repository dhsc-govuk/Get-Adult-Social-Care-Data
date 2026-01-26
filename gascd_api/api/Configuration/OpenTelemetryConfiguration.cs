using Azure.Monitor.OpenTelemetry.AspNetCore;

namespace api.Configuration;

public static class OpenTelemetryConfiguration
{
    public static IServiceCollection AddOpenTelemetryConfiguration(this IServiceCollection services, IConfiguration config)
    {
        if (config.GetValue<string>("APPLICATIONINSIGHTS_CONNECTION_STRING") != null)
        {
            services.AddOpenTelemetry().UseAzureMonitor();
        }

        return services;
    }
}