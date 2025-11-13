using FastEndpoints;

namespace api.Logging;

sealed class LogContextMiddleware(RequestDelegate next, ILogger<LogContextMiddleware> logger) 
{
    public async Task InvokeAsync(HttpContext context)
    {
        var scopeDictionary = GetScopeDictionary(context);
       
        using (logger.BeginScope(scopeDictionary))
        {
            await next(context);
        }
    }
    
    private Dictionary<string, object> GetScopeDictionary(HttpContext context)
    {
        var traceId = context.Request.Headers["x-trace-id"].FirstOrDefault();

        traceId = string.IsNullOrEmpty(traceId) ? Guid.NewGuid().ToString() : traceId;
        var requestId = Guid.NewGuid().ToString();

        return new Dictionary<string, object> { ["trace-id"] = traceId, ["request-id"] = requestId };
    }
}