using api.Data;
using api.Processors;
using FastEndpoints;
using System.Text.Json;
using System.Text.Json.Serialization;

namespace api.Configuration;

public static class FastEndpointsConfiguration
{
    public static IServiceCollection RegisterFastEndpoints(this IServiceCollection services, IConfiguration config)
    {
        return services.AddFastEndpoints()
            .ConfigureHttpJsonOptions(o =>
            {
                o.SerializerOptions.PropertyNamingPolicy = JsonNamingPolicy.SnakeCaseLower;
                o.SerializerOptions.DefaultIgnoreCondition = JsonIgnoreCondition.WhenWritingNull;
                o.SerializerOptions.Converters.Add(new JsonStringEnumConverter());
            })
            .Configure<Microsoft.AspNetCore.Mvc.JsonOptions>(o => o.JsonSerializerOptions.Converters.Add(new JsonStringEnumConverter()))
            .AddServiceHealthChecks(configureChecks: hc => hc.AddDbContextCheck<GascdDataContext>());
    }

    public static IApplicationBuilder RegisterFastEndpoints(this IApplicationBuilder app)
    {
        return app.UseFastEndpoints(c =>
            {
                c.Errors.UseProblemDetails();
                c.Endpoints.Configurator = d =>
                {
                    d.PreProcessor<VersionHandler>(Order.Before);
                    d.PostProcessor<ValidationLogger>(Order.Before);
                };
            }
        );
    }
}