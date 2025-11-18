using api.Auth;
using Microsoft.AspNetCore.Authentication;

namespace api.Configuration;

public static class AuthConfiguration
{
    public static AuthenticationBuilder RegisterAuth(this IServiceCollection services)
    {
        return services.AddAuthorization()
            .AddAuthentication(ApiKeyAuth.SchemeName)
            .AddScheme<AuthenticationSchemeOptions, ApiKeyAuth>(ApiKeyAuth.SchemeName, null);
    }

    public static IApplicationBuilder RegisterAuth(this IApplicationBuilder app)
    {
        return app.UseAuthentication()
            .UseAuthorization();
    }
}