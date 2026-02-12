using api.Endpoints.Geo.CareProviderLocationNeighbours;
using FastEndpoints;
using FastEndpoints.Testing;
using Shouldly;
using System.Net;

namespace api.Tests.Endpoints.Geo.CareProviderLocationNeighbours;

[Collection("Sequential")]
public class GetCareProviderLocationNeighboursEndpointTests(App app) : TestBase<App>
{
    [Fact]
    public async Task GetCareProviderLocationNeighbours_ReturnsOk()
    {
        var (httpCode, _) = await app.Client.GETAsync<GetCareProviderLocationNeighboursEndpoint, GetCareProviderLocationNeighboursRequest, GetCareProviderLocationNeighboursResponse>(
            new GetCareProviderLocationNeighboursRequest { CareProviderLocationCode = "1-222222222" });
        httpCode.EnsureSuccessStatusCode();
        httpCode.StatusCode.ShouldBe(HttpStatusCode.OK);
    }

}