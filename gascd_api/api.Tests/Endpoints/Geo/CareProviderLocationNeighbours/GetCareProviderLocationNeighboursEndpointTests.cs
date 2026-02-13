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
        response.Code.ShouldBe("1-000000001");
        response.Locations.ShouldNotBeEmpty();
        response.Locations.Count.ShouldBe(2);
        response.Locations.ShouldContain(cpl => cpl.LocationDetails.LocationCode == "1-000000002" && cpl.LocationDetails.LocationName == "Location 2" && cpl.LocationDetails.LaCode == "E08000014" && cpl.LocationDetails.LaName == "Liverpool" && cpl.LocationDetails.LocationCategory == "Care home" && cpl.LocationDetails.Address == "Location 2, North Pole, NP 1SC");
        response.Locations.ShouldContain(cpl => cpl.LocationDetails.LocationCode == "1-000000003" && cpl.LocationDetails.LocationName == "Location 3" && cpl.LocationDetails.LaCode == "E08000014" && cpl.LocationDetails.LaName == "Liverpool" && cpl.LocationDetails.LocationCategory == "Care home" && cpl.LocationDetails.Address == "Location 3, North Pole, NP 1SC");
    }

    [Fact]
    public async Task GetCareProviderLocationNeighbours_ReturnsLocationsWithinProvidedDistance()
    {
        var (httpCode, response) = await app.Client.GETAsync<GetCareProviderLocationNeighboursEndpoint, GetCareProviderLocationNeighboursRequest, GetCareProviderLocationNeighboursResponse>(
            new GetCareProviderLocationNeighboursRequest { CareProviderLocationCode = "1-000000001", DistanceInKm = 1 });
        httpCode.EnsureSuccessStatusCode();
        httpCode.StatusCode.ShouldBe(HttpStatusCode.OK);
        response.Locations.ShouldNotBeEmpty();
        response.Locations.Count.ShouldBe(1);
        response.Locations.ShouldContain(cpl => cpl.LocationDetails.LocationCode == "1-000000002");
    }

    [Fact]
    public async Task GetCareProviderLocationNeighbours_ReturnsAllLocationsWithinABigDistance()
    {
        var (httpCode, response) = await app.Client.GETAsync<GetCareProviderLocationNeighboursEndpoint, GetCareProviderLocationNeighboursRequest, GetCareProviderLocationNeighboursResponse>(
            new GetCareProviderLocationNeighboursRequest { CareProviderLocationCode = "1-000000001", DistanceInKm = 1000000 });
        httpCode.EnsureSuccessStatusCode();
        httpCode.StatusCode.ShouldBe(HttpStatusCode.OK);
        response.Locations.ShouldNotBeEmpty();
        response.Locations.Count.ShouldBe(6);
    }

    [Fact]
    public async Task GetCareProviderLocationNeighbours_Returns404WhenProvidedNonExistentCPLCode()
    {
        var (httpCode, _) = await app.Client.GETAsync<GetCareProviderLocationNeighboursEndpoint, GetCareProviderLocationNeighboursRequest, GetCareProviderLocationNeighboursResponse>(
            new GetCareProviderLocationNeighboursRequest { CareProviderLocationCode = "1-045678987" });
        httpCode.StatusCode.ShouldBe(HttpStatusCode.NotFound);
    }

}