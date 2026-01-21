using api.Data.Mappers;

namespace api.Configuration;

public static class SingletonConfiguration
{
    public static IServiceCollection AddSingletonConfiguration(this IServiceCollection services)
    {
        return services.AddSingleton<ReferenceMapper>()
            .AddSingleton<MetricMapper>();
    }
}