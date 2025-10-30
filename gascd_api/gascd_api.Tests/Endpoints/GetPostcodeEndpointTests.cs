using FastEndpoints;
using gascd_api.Properties.Features.Geo.Postcode;

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
       
        var (httpResponse, getLocationResponse) = await _client.GETAsync<GetPostcodeEndpoint,GetPostcodeRequest, GetPostcodeResponse>(
                new GetPostcodeRequest{ });
        httpResponse.EnsureSuccessStatusCode();
    }
}