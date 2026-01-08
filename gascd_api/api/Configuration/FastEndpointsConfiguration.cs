using FastEndpoints;
using System.Text.Json;
using System.Text.Json.Serialization;

namespace api.Configuration;

public static class FastEndpointsConfiguration
{
    public static IServiceCollection RegisterFastEndpoints(this IServiceCollection services)
    {
        return services.AddFastEndpoints()
            .ConfigureHttpJsonOptions(o =>
            {
                o.SerializerOptions.PropertyNamingPolicy = JsonNamingPolicy.SnakeCaseLower;
                o.SerializerOptions.DefaultIgnoreCondition = JsonIgnoreCondition.WhenWritingNull;
            });
    }

    public static IApplicationBuilder RegisterFastEndpoints(this IApplicationBuilder app)
    {
        return app.UseFastEndpoints(c => c.Errors.UseProblemDetails());
    }
}