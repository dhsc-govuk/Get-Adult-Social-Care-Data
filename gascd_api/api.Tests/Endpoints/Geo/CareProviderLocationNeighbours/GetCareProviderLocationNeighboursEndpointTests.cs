using api.Endpoints.Geo.CareProviderLocationNeighbours;
using FastEndpoints;
using FastEndpoints.Testing;
using Newtonsoft.Json.Linq;
using Shouldly;
using System.Net;
using static api.Tests.Fixtures.TestUtils;

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
        response.Locations[0].Distance.ShouldBe(0.11m, 0.001m);
        response.Locations[0].LocationDetails.LocationCode.ShouldBe("1-000000002");
        response.Locations[0].LocationDetails.LocationName.ShouldBe("Location 2");
        response.Locations[0].LocationDetails.LaCode.ShouldBe("E08000014");
        response.Locations[0].LocationDetails.LaName.ShouldBe("Liverpool");
        response.Locations[0].LocationDetails.LocationCategory.ShouldBe("Care home");
        response.Locations[0].LocationDetails.Address.ShouldBe("Location 2, North Pole, NP 1SC");

        response.Locations[1].Distance.ShouldBe(3.98m, 0.001m);
        response.Locations[1].LocationDetails.LocationCode.ShouldBe("1-000000003");
        response.Locations[1].LocationDetails.LocationName.ShouldBe("Location 3");
        response.Locations[1].LocationDetails.LaCode.ShouldBe("E08000014");
        response.Locations[1].LocationDetails.LaName.ShouldBe("Liverpool");
        response.Locations[1].LocationDetails.LocationCategory.ShouldBe("Care home");
        response.Locations[1].LocationDetails.Address.ShouldBe("Location 3, North Pole, NP 1SC");
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

    [Fact]
    public async Task GetCareProviderLocationNeighbours_ReturnsLimitedResponseWhenLimitIncluded()
    {
        var (httpCode, response) = await app.Client.GETAsync<GetCareProviderLocationNeighboursEndpoint, GetCareProviderLocationNeighboursRequest, GetCareProviderLocationNeighboursResponse>(
            new GetCareProviderLocationNeighboursRequest { CareProviderLocationCode = "1-000000001", DistanceInKm = 10000000, Limit = 2 });
        httpCode.EnsureSuccessStatusCode();
        httpCode.StatusCode.ShouldBe(HttpStatusCode.OK);
        response.Code.ShouldBe("1-000000001");
        response.Locations.ShouldNotBeEmpty();
        response.Locations.Count.ShouldBe(2);
        response.Locations.ShouldContain(cpl => cpl.LocationDetails.LocationCode == "1-000000002" && cpl.LocationDetails.LocationName == "Location 2" && cpl.LocationDetails.LaCode == "E08000014" && cpl.LocationDetails.LaName == "Liverpool" && cpl.LocationDetails.LocationCategory == "Care home" && cpl.LocationDetails.Address == "Location 2, North Pole, NP 1SC");
        response.Locations.ShouldContain(cpl => cpl.LocationDetails.LocationCode == "1-000000003" && cpl.LocationDetails.LocationName == "Location 3" && cpl.LocationDetails.LaCode == "E08000014" && cpl.LocationDetails.LaName == "Liverpool" && cpl.LocationDetails.LocationCategory == "Care home" && cpl.LocationDetails.Address == "Location 3, North Pole, NP 1SC");
    }

    [Fact]
    public async Task GetCareProviderLocationNeighbours_ReturnsCorrectDistanceFromEachNeighbour()
    {
        var (httpCode, response) = await app.Client.GETAsync<GetCareProviderLocationNeighboursEndpoint, GetCareProviderLocationNeighboursRequest, GetCareProviderLocationNeighboursResponse>(
            new GetCareProviderLocationNeighboursRequest { CareProviderLocationCode = "1-000000001", DistanceInKm = 10, Limit = 1 });
        httpCode.EnsureSuccessStatusCode();
        httpCode.StatusCode.ShouldBe(HttpStatusCode.OK);
        response.Code.ShouldBe("1-000000001");
        response.Locations.ShouldNotBeEmpty();
        response.Locations.Count.ShouldBe(1);
        response.Locations[0].Distance.ShouldBe(0.110m, 0.001m);
        response.Locations[0].LocationDetails.LocationCode.ShouldBe("1-000000002");
        response.Locations[0].LocationDetails.LocationName.ShouldBe("Location 2");
        response.Locations[0].LocationDetails.LaCode.ShouldBe("E08000014");
        response.Locations[0].LocationDetails.LaName.ShouldBe("Liverpool");
        response.Locations[0].LocationDetails.LocationCategory.ShouldBe("Care home");
        response.Locations[0].LocationDetails.Address.ShouldBe("Location 2, North Pole, NP 1SC");
    }

    [Fact]
    public async Task GetCareProviderLocation_ReturnsExpectedCareProviderJsonObject()
    {
        var response = await app.Client.GetAsync("/api/geo/care_provider_location/1-000000001/neighbours?distance_in_km=1&limit=1", TestContext.Current.CancellationToken);
        response.StatusCode.ShouldBe(HttpStatusCode.OK);
        var jObject = await ParseJsonResponse<JObject>(response);
        GetFromJson(jObject, "code").ShouldBe("1-000000001");
        GetFromJson(jObject, "locations[0].distance").ShouldBe("0.11057461436");
        GetFromJson(jObject, "locations[0].location_details.location_code").ShouldBe("1-000000002");
        GetFromJson(jObject, "locations[0].location_details.location_name").ShouldBe("Location 2");
        GetFromJson(jObject, "locations[0].location_details.la_code").ShouldBe("E08000014");
        GetFromJson(jObject, "locations[0].location_details.la_name").ShouldBe("Liverpool");
        GetFromJson(jObject, "locations[0].location_details.location_category").ShouldBe("Care home");
        GetFromJson(jObject, "locations[0].location_details.address").ShouldBe("Location 2, North Pole, NP 1SC");
    }

}