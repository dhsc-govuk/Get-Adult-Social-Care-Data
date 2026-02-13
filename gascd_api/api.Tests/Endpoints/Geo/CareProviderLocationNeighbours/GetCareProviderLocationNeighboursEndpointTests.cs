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
        response.Locations.ShouldContain(cpl => cpl.LocationCode == "1-000000002" && cpl.LocationName == "Location 2" && cpl.LaCode == "E08000014" && cpl.LaName == "Liverpool" && cpl.LocationCategory == "Care home" && cpl.Address == "Location 2, North Pole, NP 1SC");
        response.Locations.ShouldContain(cpl => cpl.LocationCode == "1-000000003" && cpl.LocationName == "Location 3" && cpl.LaCode == "E08000014" && cpl.LaName == "Liverpool" && cpl.LocationCategory == "Care home" && cpl.Address == "Location 3, North Pole, NP 1SC");
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
        response.Locations.ShouldContain(cpl => cpl.LocationCode == "1-000000002");
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

    //add a limit
    //add a json test
    //check shape of CPL is correct
    // maybe find two lat and long exactly eg 7km from each other and check it works

    [Fact]
    public async Task GetCareProviderLocationNeighbours_Returns404WhenProvidedNonExistentCPLCode()
    {
        var (httpCode, _) = await app.Client.GETAsync<GetCareProviderLocationNeighboursEndpoint, GetCareProviderLocationNeighboursRequest, GetCareProviderLocationNeighboursResponse>(
            new GetCareProviderLocationNeighboursRequest { CareProviderLocationCode = "1-045678987" });
        httpCode.StatusCode.ShouldBe(HttpStatusCode.NotFound);
    }

    [Fact]
    public async Task GetCareProviderLocationNeighbours_Returns404WhenProvidedCplWithNoGeodata()
    {
        var (httpCode, _) = await app.Client.GETAsync<GetCareProviderLocationNeighboursEndpoint, GetCareProviderLocationNeighboursRequest, GetCareProviderLocationNeighboursResponse>(
            new GetCareProviderLocationNeighboursRequest { CareProviderLocationCode = "1-222222225" });
        httpCode.StatusCode.ShouldBe(HttpStatusCode.NotFound);
    }

}