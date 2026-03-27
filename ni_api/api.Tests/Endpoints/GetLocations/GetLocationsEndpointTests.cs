using api.Endpoints.GetLocations;
using FastEndpoints;
using FastEndpoints.Testing;
using Shouldly;
using System.Net;

namespace api.Tests.Endpoints.GetLocations;

public class GetLocationsEndpointTests(App app) : TestBase<App>
{
  
    [Fact]
    public async Task GetLocation_ReturnsOk()
    {
        var (httpCode, _) = await app.Client.GETAsync<GetLocationsEndpoint, GetLocationsRequest, GetLocationsResponse>(
            new GetLocationsRequest { Email = "caroline@cheeseman.com" });
        httpCode.EnsureSuccessStatusCode();
        httpCode.StatusCode.ShouldBe(HttpStatusCode.OK);
    }

    [Fact]
    public async Task GetLocation_ReturnsListOfLocations()
    {
        var (httpCode, response) = await app.Client.GETAsync<GetLocationsEndpoint, GetLocationsRequest, GetLocationsResponse>(
            new GetLocationsRequest { Email = "caroline@cheeseman.com" });
        httpCode.EnsureSuccessStatusCode();
        httpCode.StatusCode.ShouldBe(HttpStatusCode.OK);
        
        response.Email.ShouldBe("caroline@cheeseman.com");
        response.Locations.Count.ShouldBe(2);
        response.Locations.ShouldContain(x => x.Code == "1-12345");
        response.Locations.ShouldContain(x => x.Code == "1-12346");
    }
    
    [Fact]
    public async Task GetLocation_ReturnsOtherListOfLocations()
    {
        var (httpCode, response) = await app.Client.GETAsync<GetLocationsEndpoint, GetLocationsRequest, GetLocationsResponse>(
            new GetLocationsRequest { Email = "charles@cheeseman.com" });
        httpCode.EnsureSuccessStatusCode();
        httpCode.StatusCode.ShouldBe(HttpStatusCode.OK);
        
        response.Email.ShouldBe("charles@cheeseman.com");
        response.Locations.Count.ShouldBe(1);
        response.Locations.ShouldContain(x => x.Code == "1-54321");
    }
    
    [Fact]
    public async Task GetLocation_404IfNoSuchUser()
    {
        var (httpCode, response) = await app.Client.GETAsync<GetLocationsEndpoint, GetLocationsRequest, GetLocationsResponse>(
            new GetLocationsRequest { Email = "katherine@cheeseman.com" });
        httpCode.StatusCode.ShouldBe(HttpStatusCode.NotFound);
        
    }
}