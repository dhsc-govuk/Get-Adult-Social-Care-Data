using api.Services.Onboarding;
using FastEndpoints;

namespace api.Endpoints.Onboarding;

public class RegisterEndpoint(IEmailSender emailSender, ILogger<RegisterEndpoint> logger)
    : Endpoint<RegisterRequest, RegisterResponse>
{
    public override void Configure()
    {
        Post("/api/onboarding/register");
        AllowAnonymous();
        Summary(s => s.Summary = "Submits a registration request and emails the requester");
    }

    public override async Task HandleAsync(RegisterRequest req, CancellationToken ct)
    {
        logger.LogDebug("Processing registration for email: {email}", req.RegMail);

        var message = new EmailMessage(
            To: req.RegMail,
            FullName: req.RegFullName,
            LocalAuthority: req.RegLa,
            OrganisationName: req.RegOrgName,
            Role: req.RegRole);

        try
        {
            await emailSender.SendAsync(message, ct);
        }
        catch (Exception e)
        {
            logger.LogError(e, "Failed to send registration email to {email}", req.RegMail);
            await Send.ErrorsAsync(StatusCodes.Status502BadGateway, ct);
            return;
        }

        logger.LogInformation("Registration email sent to {email}", req.RegMail);
        await Send.OkAsync(new RegisterResponse { Message = "Registration request received" }, ct);
    }
}
