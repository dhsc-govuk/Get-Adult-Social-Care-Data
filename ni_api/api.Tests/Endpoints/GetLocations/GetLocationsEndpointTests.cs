using api.Endpoints.GetLocations;
using FastEndpoints;
using FastEndpoints.Testing;
using Shouldly;
using System.Net;

namespace api.Tests.Endpoints.GetLocations;

// [Collection("Sequential")]
public class GetLocationsEndpointTests(App app) : TestBase<App>
{
  
    [Fact]
    public async Task GetPostCode_ReturnsOk()
    {
        var (httpCode, _) = await app.Client.GETAsync<GetLocationsEndpoint, GetLocationsRequest, GetLocationsResponse>(
            new GetLocationsRequest { Email = "test" });
        httpCode.EnsureSuccessStatusCode();
        httpCode.StatusCode.ShouldBe(HttpStatusCode.OK);
    }
    
}