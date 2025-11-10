using api.Logging;
using FastEndpoints;

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
            c.Endpoints.Configurator = ep => ep.PreProcessor<LogPreProcessor>(Order.Before);
        });
    }
}