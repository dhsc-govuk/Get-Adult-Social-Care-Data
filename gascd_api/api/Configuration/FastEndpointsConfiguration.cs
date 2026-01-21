using api.Logging;
using FastEndpoints;
using System.Text.Json;
using System.Text.Json.Serialization;

namespace api.Configuration;

public static class FastEndpointsConfiguration
{
    public static IServiceCollection RegisterFastEndpoints(this IServiceCollection services)
    {
        services = services.AddFastEndpoints()
            .ConfigureHttpJsonOptions(o =>
            {
                o.SerializerOptions.PropertyNamingPolicy = JsonNamingPolicy.SnakeCaseLower;
                o.SerializerOptions.DefaultIgnoreCondition = JsonIgnoreCondition.WhenWritingNull;
                o.SerializerOptions.Converters.Add(new JsonStringEnumConverter());
            });

        return services.Configure<Microsoft.AspNetCore.Mvc.JsonOptions>(o =>
            o.JsonSerializerOptions.Converters.Add(new JsonStringEnumConverter()));
    }

    public static IApplicationBuilder RegisterFastEndpoints(this IApplicationBuilder app)
    {
        return app.UseFastEndpoints(c =>
            {
                c.Errors.UseProblemDetails();
                c.Endpoints.Configurator = d =>
                    d.PostProcessor<ValidationLogger>(Order.Before);
            }
        );
    }
}