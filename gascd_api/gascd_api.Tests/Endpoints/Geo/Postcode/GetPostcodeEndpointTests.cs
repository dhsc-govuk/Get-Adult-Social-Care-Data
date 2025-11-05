using FastEndpoints;
using gascd_api.Endpoints.Geo.Postcode;
using gascd_api.Tests.Fixtures;
using Shouldly;
using System.Net;

namespace gascd_api.Tests.Endpoints.Geo.Postcode;

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
        response.Latitude.ShouldBe(51.33954856349381m);
        response.Longitude.ShouldBe(-0.349629386m);
        response.LaCode.ShouldBe("E07000207");
    }

    [Theory]
    [InlineData("")]
    [InlineData(" ")]
    public async Task Invalid_Empty_User_Input(string postcodeInput)
    {
        var (httpResponse, problemDetails) = await _client.GETAsync<GetPostcodeEndpoint, GetPostcodeRequest, ProblemDetails>(
            new GetPostcodeRequest { Postcode = postcodeInput });
        httpResponse.StatusCode.ShouldBe(HttpStatusCode.BadRequest);
        problemDetails.Errors.Count().ShouldBe(1);
        problemDetails.Errors.Select(e => e.Name).ShouldBe(["postcode"]);
        problemDetails.Errors.Select(e => e.Reason).ShouldBe(["Postcode is required."]);
    }

    [Fact]
    public async Task Invalid_Empty_Request()
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
    public async Task Invalid_Postcoder_Input(string postcodeInput, string expectedMessage)
    {
        var (httpResponse, problemDetails) = await _client.GETAsync<GetPostcodeEndpoint, GetPostcodeRequest, ProblemDetails>(
            new GetPostcodeRequest { Postcode = postcodeInput });
        httpResponse.StatusCode.ShouldBe(HttpStatusCode.BadRequest);
        problemDetails.Errors.Count().ShouldBe(1);
        problemDetails.Errors.Select(e => e.Name).ShouldBe(["postcode"]);
        problemDetails.Errors.Select(e => e.Reason).ShouldBe([expectedMessage]);
    }
}