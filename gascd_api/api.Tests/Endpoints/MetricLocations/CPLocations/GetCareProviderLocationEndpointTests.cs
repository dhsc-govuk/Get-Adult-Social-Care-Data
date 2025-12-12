using api.Endpoints.MetricLocation.CpLocations;
using api.Tests.Fixtures;
using FastEndpoints;
using Shouldly;
using System.Net;

namespace api.Tests.Endpoints.MetricLocations.CPLocations;

public class GetCareProviderLocationEndpointTests : IClassFixture<IntegrationTestFixture>
{
    private readonly HttpClient _client;

    public GetCareProviderLocationEndpointTests(IntegrationTestFixture fixture)
    {
        var factory = new CustomWebAppFactory(fixture.PostgresContainer);
        _client = factory.CreateClient();
    }

    [Fact]
    public async Task GetCareProviderLocation_ReturnsOk()
    {
        var (httpCode, _) =
            await _client.GETAsync<GetCareProviderLocationEndpoint, GetCareProviderLocationRequest, GetCareProviderLocationResponse>(
                new GetCareProviderLocationRequest { CareProviderLocationCode = "REPLACE THIS" });
        httpCode.EnsureSuccessStatusCode();
        httpCode.StatusCode.ShouldBe(HttpStatusCode.OK);
    }
}