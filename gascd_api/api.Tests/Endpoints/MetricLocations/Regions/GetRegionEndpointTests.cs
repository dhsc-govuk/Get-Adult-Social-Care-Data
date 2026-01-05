using api.Endpoints.MetricLocation.Regions;
using api.Tests.Fixtures;
using FastEndpoints;
using Shouldly;
using System.Net;

namespace api.Tests.Endpoints.MetricLocations.Regions;

public class GetRegionEndpointTests : IClassFixture<IntegrationTestFixture>
{
    private readonly HttpClient _client;

    public GetRegionEndpointTests(IntegrationTestFixture fixture)
    {
        var factory = new CustomWebAppFactory(fixture.PostgresContainer);
        _client = factory.CreateClient();
    }

    [Fact]
    public async Task GetRegion_ReturnsOk()
    {
        var (httpCode, _) =
            await _client.GETAsync<GetRegionEndpoint, GetRegionRequest, GetRegionResponse>(
                new GetRegionRequest { RegionCode = "E12000002" });
        httpCode.EnsureSuccessStatusCode();
        httpCode.StatusCode.ShouldBe(HttpStatusCode.OK);
    }



}