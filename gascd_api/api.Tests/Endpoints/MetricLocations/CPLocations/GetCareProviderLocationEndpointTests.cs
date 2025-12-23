using api.Endpoints.MetricLocation.CpLocations;
using api.Endpoints.Shared;
using api.Tests.Fixtures;
using FastEndpoints;
using Newtonsoft.Json.Linq;
using Shouldly;
using System.Net;
using Xunit.Internal;
using static api.Tests.Fixtures.TestUtils;

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
                new GetCareProviderLocationRequest { CareProviderLocationCode = "1-222222222" });
        httpCode.EnsureSuccessStatusCode();
        httpCode.StatusCode.ShouldBe(HttpStatusCode.OK);
    }

    [Fact]
    public async Task GetCareProviderLocation_ReturnsExpectedCareProviderData()
    {
        var (httpCode, response) =
            await _client.GETAsync<GetCareProviderLocationEndpoint, GetCareProviderLocationRequest, GetCareProviderLocationResponse>(
                new GetCareProviderLocationRequest { CareProviderLocationCode = "1-222222222" });
        httpCode.EnsureSuccessStatusCode();
        httpCode.StatusCode.ShouldBe(HttpStatusCode.OK);
        response.Code.ShouldBe("1-222222222");
        response.DisplayName.ShouldBe("Bupa Liverpool");
        response.Address.ShouldBe("Bupa Liverpool, CV2 2TN");
        response.ProviderCode.ShouldBe("1-123456789");
        response.ProviderName.ShouldBe("Bupa");
        response.NominatedIndividual.ShouldBe("Mr. Ice Cool");
        response.GeoData.Latitude.ShouldBe(53.425);
        response.GeoData.Longitude.ShouldBe(-2.88);
        List<GeoDataDto.CoordinateDto> expectedPolygon = new()
        {
            new GeoDataDto.CoordinateDto { Longitude = -3.3, Latitude = 55.26 },
            new GeoDataDto.CoordinateDto { Longitude = -2.55, Latitude = 52.26 },
            new GeoDataDto.CoordinateDto { Longitude = -2.65, Latitude = 53.73 },
            new GeoDataDto.CoordinateDto { Longitude = -3.3, Latitude = 54.73 },
            new GeoDataDto.CoordinateDto { Longitude = -3.3, Latitude = 55.26 }
        };
        response.GeoData.Polygon.ShouldBe(expectedPolygon);
        response.LocalAuthorityCode.ShouldBe(null);
        response.LocalAuthorityName.ShouldBe(null);
        response.RegionCode.ShouldBe(null);
        response.RegionName.ShouldBe(null);
        response.CountryCode.ShouldBe(null);
        response.CountryName.ShouldBe(null);
    }

    [Fact]
    public async Task GetCareProviderLocation_ReturnsExpectedCareProviderDataWithIncludeParents()
    {
        var (httpCode, response) =
            await _client.GETAsync<GetCareProviderLocationEndpoint, GetCareProviderLocationRequest, GetCareProviderLocationResponse>(
                new GetCareProviderLocationRequest { CareProviderLocationCode = "1-222222222", IncludeParents = true });
        httpCode.EnsureSuccessStatusCode();
        httpCode.StatusCode.ShouldBe(HttpStatusCode.OK);
        response.Code.ShouldBe("1-222222222");
        response.DisplayName.ShouldBe("Bupa Liverpool");
        response.Address.ShouldBe("Bupa Liverpool, CV2 2TN");
        response.ProviderCode.ShouldBe("1-123456789");
        response.ProviderName.ShouldBe("Bupa");
        response.NominatedIndividual.ShouldBe("Mr. Ice Cool");
        response.GeoData.Latitude.ShouldBe(53.425);
        response.GeoData.Longitude.ShouldBe(-2.88);
        List<GeoDataDto.CoordinateDto> expectedPolygon = new()
        {
            new GeoDataDto.CoordinateDto { Longitude = -3.3, Latitude = 55.26 },
            new GeoDataDto.CoordinateDto { Longitude = -2.55, Latitude = 52.26 },
            new GeoDataDto.CoordinateDto { Longitude = -2.65, Latitude = 53.73 },
            new GeoDataDto.CoordinateDto { Longitude = -3.3, Latitude = 54.73 },
            new GeoDataDto.CoordinateDto { Longitude = -3.3, Latitude = 55.26 }
        };
        response.GeoData.Polygon.ShouldBe(expectedPolygon);
        response.LocalAuthorityCode.ShouldBe("E08000014");
        response.LocalAuthorityName.ShouldBe("Liverpool");
        response.RegionCode.ShouldBe("E12000002");
        response.RegionName.ShouldBe("North West");
        response.CountryCode.ShouldBe("E92000001");
        response.CountryName.ShouldBe("England");
    }


    [Fact]
    public async Task GetCareProviderLocation_ReturnsExpectedCareProviderJsonObject()
    {
        var response = await _client.GetAsync("api/metric_locations/cp_locations/1-222222222", TestContext.Current.CancellationToken);
        response.StatusCode.ShouldBe(HttpStatusCode.OK);
        var jObject = await ParseJsonResponse<JObject>(response);
        GetFromJson(jObject, "code").ShouldBe("1-222222222");
        GetFromJson(jObject, "display_name").ShouldBe("Bupa Liverpool");
        GetFromJson(jObject, "address").ShouldBe("Bupa Liverpool, CV2 2TN");
        GetFromJson(jObject, "provider_code").ShouldBe("1-123456789");
        GetFromJson(jObject, "provider_name").ShouldBe("Bupa");
        GetFromJson(jObject, "nominated_individual").ShouldBe("Mr. Ice Cool");
        GetFromJson(jObject, "geo_data.latitude").ShouldBe("53.425");
        GetFromJson(jObject, "geo_data.longitude").ShouldBe("-2.88");
        GetFromJson(jObject, "geo_data.polygon[0].longitude").ShouldBe("-3.3");
        GetFromJson(jObject, "geo_data.polygon[0].latitude").ShouldBe("55.26");
        GetFromJson(jObject, "geo_data.polygon[1].longitude").ShouldBe("-2.55");
        GetFromJson(jObject, "geo_data.polygon[1].latitude").ShouldBe("52.26");
        GetFromJson(jObject, "geo_data.polygon[2].longitude").ShouldBe("-2.65");
        GetFromJson(jObject, "geo_data.polygon[2].latitude").ShouldBe("53.73");
        GetFromJson(jObject, "geo_data.polygon[3].longitude").ShouldBe("-3.3");
        GetFromJson(jObject, "geo_data.polygon[3].latitude").ShouldBe("54.73");
        GetFromJson(jObject, "geo_data.polygon[4].longitude").ShouldBe("-3.3");
        GetFromJson(jObject, "geo_data.polygon[4].latitude").ShouldBe("55.26");
    }

    [Fact]
    public async Task GetCareProviderLocation_ReturnsExpectedCareProviderJsonObjectIncludeParents()
    {
        var response = await _client.GetAsync("api/metric_locations/cp_locations/1-222222222?include_parents=true", TestContext.Current.CancellationToken);
        response.StatusCode.ShouldBe(HttpStatusCode.OK);
        var jObject = await ParseJsonResponse<JObject>(response);
        GetFromJson(jObject, "code").ShouldBe("1-222222222");
        GetFromJson(jObject, "display_name").ShouldBe("Bupa Liverpool");
        GetFromJson(jObject, "address").ShouldBe("Bupa Liverpool, CV2 2TN");
        GetFromJson(jObject, "provider_code").ShouldBe("1-123456789");
        GetFromJson(jObject, "provider_name").ShouldBe("Bupa");
        GetFromJson(jObject, "nominated_individual").ShouldBe("Mr. Ice Cool");
        GetFromJson(jObject, "geo_data.latitude").ShouldBe("53.425");
        GetFromJson(jObject, "geo_data.longitude").ShouldBe("-2.88");
        GetFromJson(jObject, "geo_data.polygon[0].longitude").ShouldBe("-3.3");
        GetFromJson(jObject, "geo_data.polygon[0].latitude").ShouldBe("55.26");
        GetFromJson(jObject, "geo_data.polygon[1].longitude").ShouldBe("-2.55");
        GetFromJson(jObject, "geo_data.polygon[1].latitude").ShouldBe("52.26");
        GetFromJson(jObject, "geo_data.polygon[2].longitude").ShouldBe("-2.65");
        GetFromJson(jObject, "geo_data.polygon[2].latitude").ShouldBe("53.73");
        GetFromJson(jObject, "geo_data.polygon[3].longitude").ShouldBe("-3.3");
        GetFromJson(jObject, "geo_data.polygon[3].latitude").ShouldBe("54.73");
        GetFromJson(jObject, "geo_data.polygon[4].longitude").ShouldBe("-3.3");
        GetFromJson(jObject, "geo_data.polygon[4].latitude").ShouldBe("55.26");
        GetFromJson(jObject, "local_authority_code").ShouldBe("E08000014");
        GetFromJson(jObject, "local_authority_name").ShouldBe("Liverpool");
        GetFromJson(jObject, "region_code").ShouldBe("E12000002");
        GetFromJson(jObject, "region_name").ShouldBe("North West");
        GetFromJson(jObject, "country_code").ShouldBe("E92000001");
        GetFromJson(jObject, "country_name").ShouldBe("England");
    }


    [Theory]
    [InlineData("1-", "Care provider location code has a minimum length of 3")]
    [InlineData("1-1234232323232344233324324", "Care provider location code has a maximum length of 15")]
    public async Task Invalid_CareProviderLocationCode_Input(string careProviderLocationCode, string expectedErrorMessage)
    {
        var (httpResponse, problemDetails) =
            await _client.GETAsync<GetCareProviderLocationEndpoint, GetCareProviderLocationRequest, ProblemDetails>(
                new GetCareProviderLocationRequest { CareProviderLocationCode = careProviderLocationCode });
        httpResponse.StatusCode.ShouldBe(HttpStatusCode.BadRequest);
        problemDetails.Errors.Count().ShouldBe(1);
        problemDetails.Errors.Select(e => e.Name).ShouldBe(["care_provider_location_code"]);
        problemDetails.Errors.Select(e => e.Reason).ShouldBe([expectedErrorMessage]);
    }

    [Fact]
    public async Task NonExistent_CareProviderLocationCode_Input()
    {
        var (httpResponse, problemDetails) =
            await _client.GETAsync<GetCareProviderLocationEndpoint, GetCareProviderLocationRequest, ProblemDetails>(
                new GetCareProviderLocationRequest { CareProviderLocationCode = "1-1234567" });
        httpResponse.StatusCode.ShouldBe(HttpStatusCode.NotFound);
    }

    [Fact]
    public async Task GetCareProviderLocation_ReturnsErrorWhenProvidedWhiteSpace()
    {
        HttpResponseMessage response = await _client.GetAsync("api/metric_locations/cp_locations/ /", TestContext.Current.CancellationToken);
        response.StatusCode.ShouldBe(HttpStatusCode.BadRequest);

        JObject? json = await ParseJsonResponse<JObject>(response);
        GetFromJson(json, "errors[0].name").ShouldBe("care_provider_location_code");
        GetFromJson(json, "errors[0].reason").ShouldBe("Care provider location code is required");
    }
}