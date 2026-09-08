using api.Endpoints.Onboarding;
using api.Tests.Fixtures;
using FastEndpoints;
using FastEndpoints.Testing;
using Shouldly;
using System.Net;

namespace api.Tests.Endpoints.Onboarding;

[Collection("Sequential")]
public class RegisterEndpointTests(App app) : TestBase<App>
{
    [Fact]
    public async Task Register_SendsEmailToRegmailAndReturnsOk()
    {
        var request = ValidRequest();
        SpyEmailSender.SentMessages.Clear();

        var (httpCode, response) =
            await app.Client.POSTAsync<RegisterEndpoint, RegisterRequest, RegisterResponse>(request);

        httpCode.StatusCode.ShouldBe(HttpStatusCode.OK);
        response.Message.ShouldBe("Registration request received");

        var sent = SpyEmailSender.SentMessages.ShouldHaveSingleItem();
        sent.To.ShouldBe(request.RegMail);
        sent.FullName.ShouldBe(request.RegFullName);
        sent.LocalAuthority.ShouldBe(request.RegLa);
        sent.OrganisationName.ShouldBe(request.RegOrgName);
        sent.Role.ShouldBe(request.RegRole);
    }

    [Fact]
    public async Task Register_ReturnsBadRequest_WhenFieldsMissing()
    {
        var request = new RegisterRequest
        {
            RegFullName = "Jane Smith",
            RegLa = "Liverpool",
            RegMail = "",
            RegOrgName = "ACME Care Ltd",
            RegRole = "Data manager"
        };

        var (httpCode, problemDetails) =
            await app.Client.POSTAsync<RegisterEndpoint, RegisterRequest, ProblemDetails>(request);

        httpCode.StatusCode.ShouldBe(HttpStatusCode.BadRequest);
        problemDetails.Errors.Select(e => e.Name).ShouldBe(["reg_mail"]);
        problemDetails.Errors.Select(e => e.Reason).ShouldBe(["Email address is required"]);
        SpyEmailSender.SentMessages.ShouldBeEmpty();
    }

    private static RegisterRequest ValidRequest() => new()
    {
        RegFullName = "Jane Smith",
        RegLa = "Liverpool",
        RegMail = "jane.smith@example.com",
        RegOrgName = "ACME Care Ltd",
        RegRole = "Data manager"
    };
}
