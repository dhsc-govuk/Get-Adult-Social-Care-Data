namespace api.Logging;

public class ApiLogger<T>(ILogger<T> logger, IHttpContextAccessor httpContextAccessor)
{
    private void Log(LogLevel level, string msg, params object[] args)
    {
        var scopeDictionary = GetScopeDictionary();
        using (logger.BeginScope(scopeDictionary))
        {
            logger.Log(level, msg, args);
        }
    }

    private Dictionary<string, object> GetScopeDictionary()
    {
        string? traceId = httpContextAccessor.HttpContext?.Items["trace-id"] as string;
        string? requestId = httpContextAccessor.HttpContext?.Items["request-id"] as string;

        if (traceId == null || requestId == null)
        {
            Warning("trace-id or request-id is null.");
            return new Dictionary<string, object>();
        }

        return new Dictionary<string, object> { ["trace-id"] = traceId, ["request-id"] = requestId };
    }

    public void Debug(string msg, params object[] args)
    {
        Log(LogLevel.Debug, msg, args);
    }

    public void Info(string msg, params object[] args)
    {
        Log(LogLevel.Information, msg, args);
    }

    public void Warning(string msg, params object[] args)
    {
        Log(LogLevel.Warning, msg, args);
    }
}