using api.Endpoints.MetricLocation.LocalAuthorities;
using api.Endpoints.Shared;
using api.Tests.Fixtures;
using FastEndpoints;
using Shouldly;
using System.Net;

namespace api.Tests.Endpoints.MetricLocations.LocalAuthorities;

public class GetLocalAuthorityEndpointTests : IClassFixture<IntegrationTestFixture>
{
    private readonly HttpClient _client;

    public GetLocalAuthorityEndpointTests(IntegrationTestFixture fixture)
    {
        var factory = new CustomWebAppFactory(fixture.PostgresContainer);
        _client = factory.CreateClient();
    }

    [Fact]
    public async Task GetLocalAuthority_ReturnsOk()
    {
        var (httpCode, _) =
            await _client.GETAsync<GetLocalAuthorityEndpoint, GetLocalAuthorityRequest, GetLocalAuthorityResponse>(
                new GetLocalAuthorityRequest { LocalAuthorityCode = "E08000014" });
        httpCode.EnsureSuccessStatusCode();
        httpCode.StatusCode.ShouldBe(HttpStatusCode.OK);
    }

    [Fact]
    public async Task GetLocalAuthority_ReturnsExpectedLAData()
    {
        var (httpCode, response) =
            await _client.GETAsync<GetLocalAuthorityEndpoint, GetLocalAuthorityRequest, GetLocalAuthorityResponse>(
                new GetLocalAuthorityRequest { LocalAuthorityCode = "E08000014" });
        httpCode.EnsureSuccessStatusCode();
        httpCode.StatusCode.ShouldBe(HttpStatusCode.OK);
        response.Code.ShouldBe("E08000014");
        response.DisplayName.ShouldBe("Liverpool");
        response.RegionCode.ShouldBe(null);
        response.CountryCode.ShouldBe(null);
        response.GeoData.Latitude.ShouldBe(53.405);
        response.GeoData.Longitude.ShouldBe(-2.98);
        List<GeoDataDto.CoordinateDto> expectedPolygon = new()
        {
            new GeoDataDto.CoordinateDto { Longitude = -3.3, Latitude = 53.26 },
            new GeoDataDto.CoordinateDto { Longitude = -2.55, Latitude = 53.26 },
            new GeoDataDto.CoordinateDto { Longitude = -2.55, Latitude = 53.73 },
            new GeoDataDto.CoordinateDto { Longitude = -3.3, Latitude = 53.73 },
            new GeoDataDto.CoordinateDto { Longitude = -3.3, Latitude = 53.26 }
        };
    }

    [Fact]
    public async Task NonExistent_LocalAuthorityCode_Input()
    {
        var (httpResponse, problemDetails) =
            await _client.GETAsync<GetLocalAuthorityEndpoint, GetLocalAuthorityRequest, ProblemDetails>(
                new GetLocalAuthorityRequest { LocalAuthorityCode = "1-128738329" });
        httpResponse.StatusCode.ShouldBe(HttpStatusCode.NotFound);
    }

}