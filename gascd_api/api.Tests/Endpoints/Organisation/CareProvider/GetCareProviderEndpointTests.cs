using api.Endpoints.Organisation.CareProvider;
using api.Tests.Fixtures;
using FastEndpoints;
using Shouldly;
using System.Net;

namespace api.Tests.Endpoints.Organisation.CareProvider;

public class GetCareProviderEndpointTests : IClassFixture<IntegrationTestFixture>
{
    private readonly HttpClient _client;

    public GetCareProviderEndpointTests(IntegrationTestFixture fixture)
    {
        var factory = new CustomWebAppFactory(fixture.PostgresContainer);
        _client = factory.CreateClient();
    }

    [Fact]
    public async Task GetCareProvider_ReturnsOk()
    {
        var (httpCode, _) = await _client.GETAsync<GetCareProviderEndpoint, GetCareProviderRequest, GetCareProviderResponse>(
            new GetCareProviderRequest { CareProviderId = "1-123456789" });
        httpCode.EnsureSuccessStatusCode();
        httpCode.StatusCode.ShouldBe(HttpStatusCode.OK);
    }

    [Fact]
    public async Task Invalid_Empty_Request()
    {
        var (httpResponse, problemDetails) = await _client.GETAsync<GetCareProviderEndpoint, ProblemDetails>();
        httpResponse.StatusCode.ShouldBe(HttpStatusCode.BadRequest);
        problemDetails.Errors.Count().ShouldBe(1);
        problemDetails.Errors.Select(e => e.Name).ShouldBe(["careProviderId"]);
        problemDetails.Errors.Select(e => e.Reason).ShouldBe(["Care provider ID is required."]);
    }

    [Theory]
    [InlineData("")]
    [InlineData(" ")]
    public async Task Invalid_Empty_User_Input(string careProviderId)
    {
        var (httpResponse, problemDetails) = await _client.GETAsync<GetCareProviderEndpoint, GetCareProviderRequest, ProblemDetails>(
            new GetCareProviderRequest { CareProviderId = careProviderId });
        httpResponse.StatusCode.ShouldBe(HttpStatusCode.BadRequest);
        problemDetails.Errors.Count().ShouldBe(1);
        problemDetails.Errors.Select(e => e.Name).ShouldBe(["careProviderId"]);
        problemDetails.Errors.Select(e => e.Reason).ShouldBe(["Care provider ID is required."]);
    }

    [Theory]
    [InlineData("1-1")]
    [InlineData("1-123456789101112")]
    public async Task Invalid_CareProviderId_Input(string careProviderId)
    {
        var (httpResponse, problemDetails) = await _client.GETAsync<GetCareProviderEndpoint, GetCareProviderRequest, ProblemDetails>(
            new GetCareProviderRequest { CareProviderId = careProviderId });
        httpResponse.StatusCode.ShouldBe(HttpStatusCode.BadRequest);
        problemDetails.Errors.Count().ShouldBe(1);
        problemDetails.Errors.Select(e => e.Name).ShouldBe(["careProviderId"]);
        // problemDetails.Errors.Select(e => e.Reason).ShouldBe([expectedMessage]);
    }
}