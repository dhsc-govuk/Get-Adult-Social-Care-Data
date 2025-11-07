namespace api.Logging;

public class AppLogging<T>(ILogger<T> logger)
{
    internal void Log(HttpContext httpContext, LogLevel level, string msg)
    {
        var traceId = httpContext.Items["trace-id"] as string;
        var requestId = httpContext.Items["request-id"] as string;

        using (logger.BeginScope(new Dictionary<string, object>
        {
            ["trace-id"] = traceId,
            ["request-id"] = requestId
        }))
        {
            logger.Log(level, msg);
        }
    }

    public void Info(HttpContext context, string msg)
    {
        Log(context, LogLevel.Information, msg);
    }
}