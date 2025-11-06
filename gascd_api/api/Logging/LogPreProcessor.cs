using FastEndpoints;

namespace api.Logging;

public class LogPreProcessor : IGlobalPreProcessor
{
    public Task PreProcessAsync(IPreProcessorContext context, CancellationToken ct)
    {
        var traceId = context.HttpContext.Request.Headers["x-trace-id"];
        if (string.IsNullOrEmpty(traceId))
        {
            return Task.CompletedTask;
        }
        
        throw new NotImplementedException();
    }
}