using api.Services.Onboarding;

namespace api.Tests.Fixtures;

public class SpyEmailSender : IEmailSender
{
    public static List<EmailMessage> SentMessages { get; } = [];

    public Task SendAsync(EmailMessage message, CancellationToken ct)
    {
        SentMessages.Add(message);
        return Task.CompletedTask;
    }
}
