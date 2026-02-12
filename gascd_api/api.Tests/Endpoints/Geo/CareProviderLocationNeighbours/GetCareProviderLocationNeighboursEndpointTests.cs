using api.Endpoints.Geo.CareProviderLocationNeighbours;
using FastEndpoints;
using FastEndpoints.Testing;
using Shouldly;
using System.Net;

namespace api.Tests.Endpoints.Geo.CareProviderLocationNeighbours;

[Collection("Sequential")]
public class GetCareProviderLocationNeighboursEndpointTests(App app) : TestBase<App>
{
    [Fact]
    public async Task GetCareProviderLocationNeighbours_ReturnsOk()
    {
        var (httpCode, _) = await app.Client.GETAsync<GetCareProviderLocationNeighboursEndpoint, GetCareProviderLocationNeighboursRequest, GetCareProviderLocationNeighboursResponse>(
            new GetCareProviderLocationNeighboursRequest { CareProviderLocationCode = "1-222222222" });
        httpCode.EnsureSuccessStatusCode();
        httpCode.StatusCode.ShouldBe(HttpStatusCode.OK);
    }

    [Fact]
    public async Task GetCareProviderLocationNeighbours_ReturnsEmptyNeighboursListWhenNoneWithinDefaultDistance()
    {
        var (httpCode, response) = await app.Client.GETAsync<GetCareProviderLocationNeighboursEndpoint, GetCareProviderLocationNeighboursRequest, GetCareProviderLocationNeighboursResponse>(
            new GetCareProviderLocationNeighboursRequest { CareProviderLocationCode = "1-000000004" });
        httpCode.EnsureSuccessStatusCode();
        httpCode.StatusCode.ShouldBe(HttpStatusCode.OK);
        response.Locations.Count.ShouldBe(0);
    }

    [Fact]
    public async Task GetCareProviderLocationNeighbours_ReturnsLocationsWithinDefaultDistance()
    {
        var (httpCode, response) = await app.Client.GETAsync<GetCareProviderLocationNeighboursEndpoint, GetCareProviderLocationNeighboursRequest, GetCareProviderLocationNeighboursResponse>(
            new GetCareProviderLocationNeighboursRequest { CareProviderLocationCode = "1-000000001" });
        httpCode.EnsureSuccessStatusCode();
        httpCode.StatusCode.ShouldBe(HttpStatusCode.OK);
        response.Locations.ShouldNotBeEmpty();
        response.Locations.Count.ShouldBe(2);
        response.Locations.ShouldContain(cpl => cpl.Code == "1-000000002");
        response.Locations.ShouldContain(cpl => cpl.Code == "1-000000003");
    }

}