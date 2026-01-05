using api.Endpoints.MetricLocation.Regions;
using api.Endpoints.Shared;
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

    [Fact]
    public async Task GetLocalAuthority_ReturnsExpectedRegionData()
    {
        var (httpCode, response) =
            await _client.GETAsync<GetRegionEndpoint, GetRegionRequest, GetRegionResponse>(
                new GetRegionRequest { RegionCode = "E12000002" });
        httpCode.EnsureSuccessStatusCode();
        httpCode.StatusCode.ShouldBe(HttpStatusCode.OK);
        response.Code.ShouldBe("E12000002");
        response.DisplayName.ShouldBe("North West");
        response.GeoData.Latitude.ShouldBe(54.075);
        response.GeoData.Longitude.ShouldBe(-2.75);
        List<GeoDataDto.CoordinateDto> expectedPolygon = new()
        {
            new GeoDataDto.CoordinateDto { Longitude = -3.8, Latitude = 52.9 },
            new GeoDataDto.CoordinateDto { Longitude = -1.8, Latitude = 52.9 },
            new GeoDataDto.CoordinateDto { Longitude = -1.8, Latitude = 55.25 },
            new GeoDataDto.CoordinateDto { Longitude = -3.8, Latitude = 55.25 },
            new GeoDataDto.CoordinateDto { Longitude = -3.8, Latitude = 52.9 }
        };
        response.GeoData.Polygon.ShouldBe(expectedPolygon);
        response.CountryCode.ShouldBe("E92000001");
        response.CountryName.ShouldBe("England");
    }



}