using api.Services.Onboarding;
using Microsoft.Extensions.Options;

namespace api.Configuration;

public static class OnboardingConfiguration
{
    public static IServiceCollection AddEmailConfiguration(this IServiceCollection services, IConfiguration config)
    {
        return services.Configure<NotifyOptions>(config.GetSection("Notify"))
            .Configure<NotifyOptions>(options =>
            {
                options.ApiKey = Environment.GetEnvironmentVariable("GOVNOTIFY_API_KEY") ?? options.ApiKey;
                options.TemplateId = Environment.GetEnvironmentVariable("GOVNOTIFY_TEMPLATE_ID") ?? options.TemplateId;
            })
            .AddScoped<IEmailSender, NotifyEmailSender>();
    }
}
