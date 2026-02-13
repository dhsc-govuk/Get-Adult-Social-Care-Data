using api.Auth;
using FastEndpoints.Swagger;
using NSwag;

namespace api.Configuration;

public static class SwaggerConfiguration
{
    public static IServiceCollection RegisterSwaggerConfiguration(this IServiceCollection services)
    {
        services.SwaggerDocument(o =>
        {
            o.EnableJWTBearerAuth = false;
            o.DocumentSettings = s =>
            {
                s.AddAuth(ApiKeyAuth.SchemeName,
                    new()
                    {
                        Name = ApiKeyAuth.HeaderName,
                        In = OpenApiSecurityApiKeyLocation.Header,
                        Type = OpenApiSecuritySchemeType.ApiKey
                    });
            };
        });
        return services;
    }
}