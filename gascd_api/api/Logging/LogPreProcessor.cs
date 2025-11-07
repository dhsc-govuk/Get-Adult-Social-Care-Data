using FastEndpoints;

namespace api.Logging;

public class LogPreProcessor : IGlobalPreProcessor
{
    public Task PreProcessAsync(IPreProcessorContext context, CancellationToken ct)
    {
        var traceId = context.HttpContext.Request.Headers["x-trace-id"].FirstOrDefault();

        traceId = string.IsNullOrEmpty(traceId) ? Guid.NewGuid().ToString() : traceId;
        var requestId = Guid.NewGuid().ToString();

        context.HttpContext.Items["trace-id"] = traceId;
        context.HttpContext.Items["request-id"] = requestId;

        return Task.CompletedTask;
    }
}