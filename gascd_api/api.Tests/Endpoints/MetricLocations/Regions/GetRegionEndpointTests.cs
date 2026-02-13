using api.Endpoints.MetricLocation.Regions;
using api.Endpoints.Shared;
using FastEndpoints;
using FastEndpoints.Testing;
using Newtonsoft.Json.Linq;
using Shouldly;
using System.Net;
using static api.Tests.Fixtures.TestUtils;

namespace api.Tests.Endpoints.MetricLocations.Regions;

public class GetRegionEndpointTests(App app) : TestBase<App>
{
    [Fact]
    public async Task GetRegion_ReturnsOk()
    {
        var (httpCode, _) =
            await app.Client.GETAsync<GetRegionEndpoint, GetRegionRequest, GetRegionResponse>(
                new GetRegionRequest { RegionCode = "E12000002" });
        httpCode.EnsureSuccessStatusCode();
        httpCode.StatusCode.ShouldBe(HttpStatusCode.OK);
    }

    [Fact]
    public async Task GetRegion_ReturnsExpectedRegionData()
    {
        var (httpCode, response) =
            await app.Client.GETAsync<GetRegionEndpoint, GetRegionRequest, GetRegionResponse>(
                new GetRegionRequest { RegionCode = "E12000002" });
        httpCode.EnsureSuccessStatusCode();
        httpCode.StatusCode.ShouldBe(HttpStatusCode.OK);
        response.Code.ShouldBe("E12000002");
        response.DisplayName.ShouldBe("North West");
        response.GeoData!.Latitude.ShouldBe(54.075);
        response.GeoData!.Longitude.ShouldBe(-2.75);
        List<GeoDataDto.CoordinateDto> expectedPolygon =
        [
            new() { Longitude = -3.8, Latitude = 52.9 },
            new() { Longitude = -1.8, Latitude = 52.9 },
            new() { Longitude = -1.8, Latitude = 55.25 },
            new() { Longitude = -3.8, Latitude = 55.25 },
            new() { Longitude = -3.8, Latitude = 52.9 }
        ];
        response.GeoData!.Polygon.ShouldBe(expectedPolygon);
        response.CountryCode.ShouldBe("E92000001");
        response.CountryName.ShouldBe("England");
        response.LocalAuthorities.Count.ShouldBe(3);
        response.LocalAuthorities.ShouldContain(x => x.LaName == "Liverpool" && x.LaCode == "E08000014");
        response.LocalAuthorities.ShouldContain(x => x.LaName == "Manchester" && x.LaCode == "E08000015");
        response.LocalAuthorities.ShouldContain(x => x.LaName == "Cheshire" && x.LaCode == "E08000016");
    }


    [Fact]
    public async Task GetRegion_WithNullGeoData_AndNoLAs_ReturnsExpectedRegionData()
    {
        var (httpCode, response) =
            await app.Client.GETAsync<GetRegionEndpoint, GetRegionRequest, GetRegionResponse>(
                new GetRegionRequest { RegionCode = "E12000003" });
        httpCode.EnsureSuccessStatusCode();
        httpCode.StatusCode.ShouldBe(HttpStatusCode.OK);
        response.Code.ShouldBe("E12000003");
        response.DisplayName.ShouldBe("North East");
        response.GeoData.ShouldBe(null);
        response.CountryCode.ShouldBe("E92000001");
        response.CountryName.ShouldBe("England");
        response.LocalAuthorities.Count.ShouldBe(0);
    }

    [Fact]
    public async Task GetRegion_ReturnsExpectedRegionJsonObject()
    {
        var response = await app.Client.GetAsync("api/metric_locations/regions/E12000002", TestContext.Current.CancellationToken);
        response.StatusCode.ShouldBe(HttpStatusCode.OK);
        var jObject = await ParseJsonResponse<JObject>(response);
        GetFromJson(jObject, "code").ShouldBe("E12000002");
        GetFromJson(jObject, "display_name").ShouldBe("North West");
        GetFromJson(jObject, "geo_data.latitude").ShouldBe("54.075");
        GetFromJson(jObject, "geo_data.longitude").ShouldBe("-2.75");
        GetFromJson(jObject, "geo_data.polygon[0].longitude").ShouldBe("-3.8");
        GetFromJson(jObject, "geo_data.polygon[0].latitude").ShouldBe("52.9");
        GetFromJson(jObject, "geo_data.polygon[1].longitude").ShouldBe("-1.8");
        GetFromJson(jObject, "geo_data.polygon[1].latitude").ShouldBe("52.9");
        GetFromJson(jObject, "geo_data.polygon[2].longitude").ShouldBe("-1.8");
        GetFromJson(jObject, "geo_data.polygon[2].latitude").ShouldBe("55.25");
        GetFromJson(jObject, "geo_data.polygon[3].longitude").ShouldBe("-3.8");
        GetFromJson(jObject, "geo_data.polygon[3].latitude").ShouldBe("55.25");
        GetFromJson(jObject, "geo_data.polygon[4].longitude").ShouldBe("-3.8");
        GetFromJson(jObject, "geo_data.polygon[4].latitude").ShouldBe("52.9");
        GetFromJson(jObject, "country_code").ShouldBe("E92000001");
        GetFromJson(jObject, "country_name").ShouldBe("England");
        GetFromJson(jObject, "local_authorities[0].la_name").ShouldBe("Liverpool");
        GetFromJson(jObject, "local_authorities[0].la_code").ShouldBe("E08000014");
        GetFromJson(jObject, "local_authorities[1].la_name").ShouldBe("Manchester");
        GetFromJson(jObject, "local_authorities[1].la_code").ShouldBe("E08000015");
        GetFromJson(jObject, "local_authorities[2].la_name").ShouldBe("Cheshire");
        GetFromJson(jObject, "local_authorities[2].la_code").ShouldBe("E08000016");
    }

    [Theory]
    [InlineData("1-", "Region code has a minimum length of 3")]
    [InlineData("1-123433232232333324324", "Region code has a maximum length of 15")]
    public async Task Invalid_RegionCode_Input(string regionCode, string expectedErrorMessage)
    {
        var (httpResponse, problemDetails) =
            await app.Client.GETAsync<GetRegionEndpoint, GetRegionRequest, ProblemDetails>(
                new GetRegionRequest { RegionCode = regionCode });
        httpResponse.StatusCode.ShouldBe(HttpStatusCode.BadRequest);
        problemDetails.Errors.Count().ShouldBe(1);
        problemDetails.Errors.Select(e => e.Name).ShouldBe(["region_code"]);
        problemDetails.Errors.Select(e => e.Reason).ShouldBe([expectedErrorMessage]);
    }

    [Fact]
    public async Task NonExistent_RegionCode_Input()
    {
        var (httpResponse, problemDetails) =
            await app.Client.GETAsync<GetRegionEndpoint, GetRegionRequest, ProblemDetails>(
                new GetRegionRequest { RegionCode = "1-134343434" });
        httpResponse.StatusCode.ShouldBe(HttpStatusCode.NotFound);
    }

    [Fact]
    public async Task GetRegion_ReturnsErrorWhenProvidedWhiteSpace()
    {
        HttpResponseMessage response = await app.Client.GetAsync("api/metric_locations/regions/ /", TestContext.Current.CancellationToken);
        response.StatusCode.ShouldBe(HttpStatusCode.BadRequest);

        JObject? json = await ParseJsonResponse<JObject>(response);
        GetFromJson(json, "errors[0].name").ShouldBe("region_code");
        GetFromJson(json, "errors[0].reason").ShouldBe("Region code is required");
    }
}