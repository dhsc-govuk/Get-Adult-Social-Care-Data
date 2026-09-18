using System.Threading.RateLimiting;
using Microsoft.AspNetCore.RateLimiting;

namespace api.Configuration;

public static class RateLimitingConfiguration
{
    public static IServiceCollection RegisterRateLimiting(this IServiceCollection services, IConfiguration config)
    {
        var permits = config.GetValue<int?>("RateLimiting:ConcurrencyLimit") ?? 20;
        var maxLocations = config.GetValue<int?>("RateLimiting:MaxLocations") ?? 500;
        if (permits is < 1 or > 1000 || maxLocations is < 1 or > 1000)
            throw new InvalidOperationException("Invalid rate-limiting configuration");
        var enabled = config.GetValue<bool?>("RateLimiting:Enabled") ?? true;
        return services.AddRateLimiter(options =>
        {
            options.RejectionStatusCode = StatusCodes.Status429TooManyRequests;
            options.GlobalLimiter = PartitionedRateLimiter.Create<HttpContext, string>(context =>
                !enabled || !context.Request.Path.StartsWithSegments("/api")
                    ? RateLimitPartition.GetNoLimiter("exempt")
                    : RateLimitPartition.GetConcurrencyLimiter("data-api", _ => new ConcurrencyLimiterOptions
                    {
                        PermitLimit = permits,
                        QueueLimit = 0,
                        QueueProcessingOrder = QueueProcessingOrder.OldestFirst
                    }));
            options.OnRejected = async (context, token) =>
            {
                context.HttpContext.Response.Headers.CacheControl = "no-store";
                // Concurrency limits have no known reset time, so no Retry-After is invented.
                await context.HttpContext.Response.WriteAsJsonAsync(new
                {
                    code = "RATE_LIMITED", error = "The data service is busy. Please try again shortly."
                }, token);
            };
        });
    }
}
