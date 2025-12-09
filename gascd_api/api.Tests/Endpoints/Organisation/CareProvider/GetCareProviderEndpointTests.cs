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
        var (httpCode, _) = await _client.GETAsync<GetCareProviderEndpoint, GetCareProviderRequest, List<GetCareProviderResponse>>(
            new GetCareProviderRequest { CareProviderId = "1-123456789" });
        httpCode.EnsureSuccessStatusCode();
        httpCode.StatusCode.ShouldBe(HttpStatusCode.OK);
    }

    [Fact]
    public async Task GetCareProvider_ReturnsExpectedCareProviderData()
    {
        var (httpCode, response) =
            await _client.GETAsync<GetCareProviderEndpoint, GetCareProviderRequest, List<GetCareProviderResponse>>(
                new GetCareProviderRequest { CareProviderId = "1-123456789" });
        httpCode.EnsureSuccessStatusCode();
        httpCode.StatusCode.ShouldBe(HttpStatusCode.OK);
        response.ShouldNotBeEmpty();
        response.Count.ShouldBe(1);
        response[0].LocationName.ShouldBe("Bupa Liverpool");
        response[0].LocationId.ShouldBe("1-222222222");
    }

    [Fact]
    public async Task GetCareProvider_ReturnsMultipleCareProviderLocations()
    {
        var (httpCode, response) =
            await _client.GETAsync<GetCareProviderEndpoint, GetCareProviderRequest, List<GetCareProviderResponse>>(
                new GetCareProviderRequest { CareProviderId = "1-123456777" });
        httpCode.EnsureSuccessStatusCode();
        httpCode.StatusCode.ShouldBe(HttpStatusCode.OK);
        response.ShouldNotBeEmpty();
        response.Count.ShouldBe(2);
        response.ShouldContain(o => o.LocationName == "Katherines Teeth" && o.LocationId == "1-222222223");
        response.ShouldContain(o => o.LocationName == "Katherines Eyes" && o.LocationId == "1-222222224");
    }

    [Theory]
    [InlineData("1-", "Care provider ID has a minimum length of 3")]
    [InlineData("1-12345678910111", "Care provider ID has a maximum length of 15")]
    public async Task Invalid_CareProviderId_Input(string careProviderId, string expectedErrorMessage)
    {
        var (httpResponse, problemDetails) = await _client.GETAsync<GetCareProviderEndpoint, GetCareProviderRequest, ProblemDetails>(
            new GetCareProviderRequest { CareProviderId = careProviderId });
        httpResponse.StatusCode.ShouldBe(HttpStatusCode.BadRequest);
        problemDetails.Errors.Count().ShouldBe(1);
        problemDetails.Errors.Select(e => e.Name).ShouldBe(["careProviderId"]);
        problemDetails.Errors.Select(e => e.Reason).ShouldBe([expectedErrorMessage]);
    }
}