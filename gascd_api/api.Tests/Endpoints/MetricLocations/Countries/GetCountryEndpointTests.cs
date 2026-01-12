using api.Endpoints.MetricLocation.Countries;
using api.Endpoints.Shared;
using api.Tests.Fixtures;
using FastEndpoints;
using Newtonsoft.Json.Linq;
using Shouldly;
using System.Net;
using static api.Tests.Fixtures.TestUtils;

namespace api.Tests.Endpoints.MetricLocations.Countries;

public class GetCountryEndpointTests : IClassFixture<IntegrationTestFixture>
{
    private readonly HttpClient _client;

    public GetCountryEndpointTests(IntegrationTestFixture fixture)
    {
        var factory = new CustomWebAppFactory(fixture.PostgresContainer);
        _client = factory.CreateClient();
    }

    [Fact]
    public async Task GetCountry_ReturnsOk()
    {
        var (httpCode, _) =
            await _client.GETAsync<GetCountryEndpoint, GetCountryRequest, GetCountryResponse>(
                new GetCountryRequest { CountryCode = "E92000001" });
        httpCode.EnsureSuccessStatusCode();
        httpCode.StatusCode.ShouldBe(HttpStatusCode.OK);
    }

    [Fact]
    public async Task GetCountry_ReturnsExpectedCountryData()
    {
        var (httpCode, response) =
            await _client.GETAsync<GetCountryEndpoint, GetCountryRequest, GetCountryResponse>(
                new GetCountryRequest { CountryCode = "E92000001" });
        httpCode.EnsureSuccessStatusCode();
        httpCode.StatusCode.ShouldBe(HttpStatusCode.OK);
        response.Code.ShouldBe("E92000001");
        response.DisplayName.ShouldBe("England");
        response.GeoData.Latitude.ShouldBe(52.561928);
        response.GeoData.Longitude.ShouldBe(-1.464854);
        List<GeoDataDto.CoordinateDto> expectedPolygon = new()
        {
            new GeoDataDto.CoordinateDto { Longitude = -3.8, Latitude = 50.0 },
            new GeoDataDto.CoordinateDto { Longitude = -1.8, Latitude = 53.9 },
            new GeoDataDto.CoordinateDto { Longitude = -1.8, Latitude = 55.25 },
            new GeoDataDto.CoordinateDto { Longitude = -3.9, Latitude = 52.25 },
            new GeoDataDto.CoordinateDto { Longitude = -3.8, Latitude = 50.0 }
        };
        response.GeoData.Polygon.ShouldBe(expectedPolygon);
    }

    [Fact]
    public async Task GetCountry_NullGeoData_ReturnsExpectedCountryData()
    {
        var (httpCode, response) =
            await _client.GETAsync<GetCountryEndpoint, GetCountryRequest, GetCountryResponse>(
                new GetCountryRequest { CountryCode = "E92000002" });
        httpCode.EnsureSuccessStatusCode();
        httpCode.StatusCode.ShouldBe(HttpStatusCode.OK);
        response.Code.ShouldBe("E92000002");
        response.DisplayName.ShouldBe("Scotland");
        response.GeoData.ShouldBe(null);

    }

    [Fact]
    public async Task GetCountry_ReturnsExpectedCountryJsonObject()
    {
        var response = await _client.GetAsync("api/metric_locations/countries/E92000001", TestContext.Current.CancellationToken);
        response.StatusCode.ShouldBe(HttpStatusCode.OK);
        var jObject = await ParseJsonResponse<JObject>(response);
        GetFromJson(jObject, "code").ShouldBe("E92000001");
        GetFromJson(jObject, "display_name").ShouldBe("England");
        GetFromJson(jObject, "geo_data.latitude").ShouldBe("52.561928");
        GetFromJson(jObject, "geo_data.longitude").ShouldBe("-1.464854");
        GetFromJson(jObject, "geo_data.polygon[0].longitude").ShouldBe("-3.8");
        GetFromJson(jObject, "geo_data.polygon[0].latitude").ShouldBe("50");
        GetFromJson(jObject, "geo_data.polygon[1].longitude").ShouldBe("-1.8");
        GetFromJson(jObject, "geo_data.polygon[1].latitude").ShouldBe("53.9");
        GetFromJson(jObject, "geo_data.polygon[2].longitude").ShouldBe("-1.8");
        GetFromJson(jObject, "geo_data.polygon[2].latitude").ShouldBe("55.25");
        GetFromJson(jObject, "geo_data.polygon[3].longitude").ShouldBe("-3.9");
        GetFromJson(jObject, "geo_data.polygon[3].latitude").ShouldBe("52.25");
        GetFromJson(jObject, "geo_data.polygon[4].longitude").ShouldBe("-3.8");
        GetFromJson(jObject, "geo_data.polygon[4].latitude").ShouldBe("50");

    }

    [Theory]
    [InlineData("1-", "Country code has a minimum length of 3")]
    [InlineData("1-123433232232333324324", "Country code has a maximum length of 15")]
    public async Task Invalid_CareProviderLocationCode_Input(string countryCode, string expectedErrorMessage)
    {
        var (httpResponse, problemDetails) =
            await _client.GETAsync<GetCountryEndpoint, GetCountryRequest, ProblemDetails>(
                new GetCountryRequest { CountryCode = countryCode });
        httpResponse.StatusCode.ShouldBe(HttpStatusCode.BadRequest);
        problemDetails.Errors.Count().ShouldBe(1);
        problemDetails.Errors.Select(e => e.Name).ShouldBe(["country_code"]);
        problemDetails.Errors.Select(e => e.Reason).ShouldBe([expectedErrorMessage]);
    }

    [Fact]
    public async Task NonExistent_CountryCode_Input()
    {
        var (httpResponse, problemDetails) =
            await _client.GETAsync<GetCountryEndpoint, GetCountryRequest, ProblemDetails>(
                new GetCountryRequest { CountryCode = "1-134343434" });
        httpResponse.StatusCode.ShouldBe(HttpStatusCode.NotFound);
    }

}