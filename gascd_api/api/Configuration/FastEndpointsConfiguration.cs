using api.Logging;
using FastEndpoints;
using System.Text.Json;

namespace api.Configuration;

public static class FastEndpointsConfiguration
{
    public static IServiceCollection RegisterFastEndpoints(this IServiceCollection services)
    {
        return services.AddFastEndpoints();
    }

    public static IApplicationBuilder RegisterFastEndpoints(this IApplicationBuilder app)
    {
        return app.UseFastEndpoints(c =>
            {
                c.Errors.UseProblemDetails();
                c.Serializer.Options.PropertyNamingPolicy = JsonNamingPolicy.SnakeCaseLower;
            }
        );
    }
}