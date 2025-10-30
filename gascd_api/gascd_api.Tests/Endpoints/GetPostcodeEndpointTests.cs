using FastEndpoints;
using gascd_api.Properties.Features.Geo.Postcode;
using Shouldly;
using System.Net;

namespace gascd_api.Tests.Endpoints;

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
        var (httpResponse, getLocationResponse) = await _client.GETAsync<GetPostcodeEndpoint, GetPostcodeRequest, GetPostcodeResponse>(
                new GetPostcodeRequest {Postcode = "NE1 4BJ"});
        httpResponse.EnsureSuccessStatusCode();
    }
    
    [Fact]
    public async Task Invalid_User_Input()
    {
        var (httpResponse, problemDetails) = await _client.GETAsync<GetPostcodeEndpoint, GetPostcodeRequest, ProblemDetails>(
            new GetPostcodeRequest {Postcode = " "});
        httpResponse.StatusCode.ShouldBe(HttpStatusCode.BadRequest);
        problemDetails.Errors.Count().ShouldBe(1);
        problemDetails.Errors.Select(e => e.Name).ShouldBe(["postcode"]);
        problemDetails.Errors.Select(e => e.Reason).ShouldBe(["Postcode is required."]);
    }
}