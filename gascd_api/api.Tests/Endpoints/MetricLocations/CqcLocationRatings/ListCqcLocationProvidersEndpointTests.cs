using api.Endpoints.MetricLocation.CqcLocationRatings;
using FastEndpoints;
using FastEndpoints.Testing;
using Shouldly;
using System.Net;

namespace api.Tests.Endpoints.MetricLocations.CqcLocationRatings;

[Collection("Sequential")]
public class ListCqcLocationProvidersEndpointTests(App app) : TestBase<App>
{
    [Fact]
    public async Task ListCqcLocationProviders_ReturnsEachProviderOnceOrderedByName()
    {
        var (httpCode, response) =
            await app.Client.GETAsync<ListCqcLocationProvidersEndpoint, ListCqcLocationProvidersResponse>();

        httpCode.StatusCode.ShouldBe(HttpStatusCode.OK);
        response.Providers.Select(x => (x.Code, x.Name)).ShouldBe(
        [
            ("1-200000002", "Anfield Support Ltd"),
            ("1-200000003", "Piccadilly Care Ltd"),
            ("1-200000001", "Riverside Care Ltd"),
        ]);
    }
}