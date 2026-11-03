using api.Services;

namespace api.Configuration;

public static class ScopedConfiguration
{
    public static IServiceCollection AddScopedConfiguration(this IServiceCollection services)
    {
        return services.AddScoped<LocalAuthorityMetricValuesService>();
    }
}
