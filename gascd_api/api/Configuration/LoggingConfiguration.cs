using api.Logging;
using FastEndpoints;

namespace api.Configuration;

public static class LoggingConfiguration
{
    public static ILoggingBuilder RegisterLoggingConfiguration(this ILoggingBuilder bld)
    {
        bld.ClearProviders()
            .AddJsonConsole(o =>
                {
                    o.TimestampFormat = "[HH:mm:ss] ";
                    o.IncludeScopes = true;
                    o.UseUtcTimestamp = true;
                }
            )
            .AddDebug()
            .SetMinimumLevel(LogLevel.Information);
        return bld;
    }
}