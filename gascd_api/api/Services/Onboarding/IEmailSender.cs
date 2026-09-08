using Microsoft.Extensions.Options;
using Notify.Client;

namespace api.Services.Onboarding;

public interface IEmailSender
{
    Task SendAsync(EmailMessage message, CancellationToken ct);
}

public class NotifyEmailSender(IOptions<NotifyOptions> options, ILogger<NotifyEmailSender> logger) : IEmailSender
{
    private readonly NotifyOptions _options = options.Value;

    public async Task SendAsync(EmailMessage message, CancellationToken ct)
    {
        logger.LogInformation("Sending email to {To} with template {TemplateId}", message.To, _options.TemplateId);

        // TODO: Consider registering a shared NotificationClient (with a shared HttpClient)
        // as a singleton to avoid creating a new client per send.
        var client = new NotificationClient(_options.ApiKey);

        // Personalisation keys must match the placeholders (e.g. ((Name))) in the
        // GOV.UK Notify email template configured against TemplateId.
        await client.SendEmailAsync(
            emailAddress: message.To,
            templateId: _options.TemplateId,
            personalisation: new Dictionary<string, object>
            {
                // "Name" placeholder is used for the requester's full name.
                { "Name", message.FullName },
                { "local_authority", message.LocalAuthority },
                { "organisation_name", message.OrganisationName },
                { "role", message.Role },
            },
            clientReference: message.ClientReference);
    }
}

// GOV.UK Notify sends from the service account's configured "from address"/sender name,
// so no SMTP Host/Port/From options are required here.
public class NotifyOptions
{
    // TODO: Supply the GOV.UK Notify service API key (secret). Keep it out of source control,
    // e.g. via environment variable or secret store, referenced as Notify:ApiKey.
    public string ApiKey { get; set; } = string.Empty;

    // TODO: Supply the template ID of the GOV.UK Notify email template used for registration.
    public string TemplateId { get; set; } = string.Empty;
}

public record EmailMessage(
    string To,
    string FullName,
    string LocalAuthority,
    string OrganisationName,
    string Role,
    string? ClientReference = null);
