namespace api.Logging;

public class AppLogging<T>(ILogger<T> logger, IHttpContextAccessor httpContextAccessor)
{
    private void Log(LogLevel level, string msg)
    {
        var traceId = httpContextAccessor.HttpContext?.Items["trace-id"] as string;
        var requestId = httpContextAccessor.HttpContext?.Items["request-id"] as string;

        using (logger.BeginScope(new Dictionary<string, string?>
        {
            ["trace-id"] = traceId,
            ["request-id"] = requestId
        }))
        {
            logger.Log(level, msg);
        }
    }

    public void Info(string msg)
    {
        Log(LogLevel.Information, msg);
    }
}