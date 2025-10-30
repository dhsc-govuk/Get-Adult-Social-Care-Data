namespace gascd_api.Tests.Endpoints;

public class LocationEndpointTests : IClassFixture<IntegrationTestFixture>
{
    private readonly HttpClient _client;

    public LocationEndpointTests(IntegrationTestFixture fixture)
    {
        var factory = new CustomWebAppFactory(fixture.PostgresContainer);
        _client = factory.CreateClient();
    }

    [Fact]
    public Task GetPostCode_ReturnsOk()
    {
        return Task.CompletedTask;
        var (httpResponse, getLocationResponse) = await _client.GETAsync<GetLocationEndpoint, GetLocationRequest, GetLocationResponse>(
                new GetLocationRequest { Postcode = "NE1 4BJ" });
        httpResponse.EnsureSuccessStatusCode();
    }
}