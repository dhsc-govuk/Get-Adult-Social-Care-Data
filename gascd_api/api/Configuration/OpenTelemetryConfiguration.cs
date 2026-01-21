using Azure.Monitor.OpenTelemetry.AspNetCore;

namespace api.Configuration;

public static class OpenTelemetryConfiguration
{
    public static IServiceCollection AddOpenTelemetryConfiguration(this IServiceCollection services)
    {
        services.AddOpenTelemetry().UseAzureMonitor();

        return services;
    }
}