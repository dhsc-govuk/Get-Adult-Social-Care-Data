using api.Endpoints.Geo.Postcode;
using api.Endpoints.Shared;
using api.Tests.Fixtures;
using FastEndpoints;
using Shouldly;
using System.Net;

namespace api.Tests.Endpoints.Geo.Postcode;

public class GetPostcodeEndpointTests : IClassFixture<IntegrationTestFixture>
{
    private readonly HttpClient _client;

    public GetPostcodeEndpointTests(IntegrationTestFixture fixture)
    {
        var factory = new CustomWebAppFactory(fixture.PostgresContainer);
        _client = factory.CreateClient();
    }

    [Fact]
    public async Task GetPostCode_ReturnsOk()
    {
        var (httpCode, _) = await _client.GETAsync<GetPostcodeEndpoint, GetPostcodeRequest, GetPostcodeResponse>(
                new GetPostcodeRequest { Postcode = "KT220UF" });
        httpCode.EnsureSuccessStatusCode();
        httpCode.StatusCode.ShouldBe(HttpStatusCode.OK);
    }

    [Fact]
    public async Task GetUnknownPostCode_Returns404()
    {
        var (httpCode, _) = await _client.GETAsync<GetPostcodeEndpoint, GetPostcodeRequest, GetPostcodeResponse>(
            new GetPostcodeRequest { Postcode = "NE14BJ" });
        httpCode.StatusCode.ShouldBe(HttpStatusCode.NotFound);
    }

    [Fact]
    public async Task GetPostCode_ReturnsCorrectData()
    {
        var (httpCode, response) = await _client.GETAsync<GetPostcodeEndpoint, GetPostcodeRequest, GetPostcodeResponse>(
            new GetPostcodeRequest { Postcode = "KT220UF" });
        httpCode.EnsureSuccessStatusCode();
        response.SanitisedPostcode.ShouldBe("KT220UF");
        response.DisplayPostcode.ShouldBe("KT22 0UF");
        response.GeoData!.Latitude.ShouldBe(51.33954856349381d);
        response.GeoData!.Longitude.ShouldBe(-0.349629386d);
        List<GeoDataDto.CoordinateDto> expectedPolygon =
        [
            new() { Longitude = -3.3, Latitude = 55.26 },
            new() { Longitude = -2.55, Latitude = 59.6 },
            new() { Longitude = -2.95, Latitude = 54.73 },
            new() { Longitude = -3.1, Latitude = 52.73 },
            new() { Longitude = -3.3, Latitude = 55.26 }
        ];
        response.GeoData!.Polygon.ShouldBe(expectedPolygon);
        response.LaCode.ShouldBe("E08000014");
        response.LaName.ShouldBe("Liverpool");
    }

    [Fact]
    public async Task GetPostCode_NullGeoData_ReturnsCorrectData()
    {
        var (httpCode, response) = await _client.GETAsync<GetPostcodeEndpoint, GetPostcodeRequest, GetPostcodeResponse>(
            new GetPostcodeRequest { Postcode = "CV23TN" });
        httpCode.EnsureSuccessStatusCode();
        response.SanitisedPostcode.ShouldBe("CV23TN");
        response.DisplayPostcode.ShouldBe("CV2 3TN");
        response.GeoData.ShouldBe(null);
        response.LaCode.ShouldBe("E08000016");
        response.LaName.ShouldBe("Cheshire");
    }

    [Theory]
    [InlineData("")]
    [InlineData(" ")]
    public async Task Invalid_EmptyPostcode_User_Input(string postcodeInput)
    {
        var (httpResponse, problemDetails) = await _client.GETAsync<GetPostcodeEndpoint, GetPostcodeRequest, ProblemDetails>(
            new GetPostcodeRequest { Postcode = postcodeInput });
        httpResponse.StatusCode.ShouldBe(HttpStatusCode.BadRequest);
        problemDetails.Errors.Count().ShouldBe(1);
        problemDetails.Errors.Select(e => e.Name).ShouldBe(["postcode"]);
        problemDetails.Errors.Select(e => e.Reason).ShouldBe(["Postcode is required."]);
    }

    [Fact]
    public async Task Invalid_EmptyPostcode_Request()
    {
        var (httpResponse, problemDetails) = await _client.GETAsync<GetPostcodeEndpoint, ProblemDetails>();
        httpResponse.StatusCode.ShouldBe(HttpStatusCode.BadRequest);
        problemDetails.Errors.Count().ShouldBe(1);
        problemDetails.Errors.Select(e => e.Name).ShouldBe(["postcode"]);
        problemDetails.Errors.Select(e => e.Reason).ShouldBe(["Postcode is required."]);
    }


    [Theory]
    [InlineData("NE1 4BJ", "Postcode includes invalid characters")]
    [InlineData("KATHERINE", "Postcode should have a maximum of length of 7")]
    [InlineData("KAT", "Postcode should have a minimum of length of 5")]
    public async Task Invalid_Postcode_Input(string postcodeInput, string expectedMessage)
    {
        var (httpResponse, problemDetails) = await _client.GETAsync<GetPostcodeEndpoint, GetPostcodeRequest, ProblemDetails>(
            new GetPostcodeRequest { Postcode = postcodeInput });
        httpResponse.StatusCode.ShouldBe(HttpStatusCode.BadRequest);
        problemDetails.Errors.Count().ShouldBe(1);
        problemDetails.Errors.Select(e => e.Name).ShouldBe(["postcode"]);
        problemDetails.Errors.Select(e => e.Reason).ShouldBe([expectedMessage]);
    }
}