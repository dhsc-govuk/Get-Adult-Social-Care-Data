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
}