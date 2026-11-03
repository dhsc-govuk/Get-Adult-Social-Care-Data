using api.Endpoints.MetricLocation.LocalAuthorities;
using FastEndpoints;
using FastEndpoints.Testing;
using Shouldly;
using System.Net;

namespace api.Tests.Endpoints.MetricLocations.LocalAuthorities;

[Collection("Sequential")]
public class ListLocalAuthoritiesEndpointTests(App app) : TestBase<App>
{
    [Fact]
    public async Task ListLocalAuthorities_ReturnsAllLasOrderedByName()
    {
        var (httpCode, response) =
            await app.Client.GETAsync<ListLocalAuthoritiesEndpoint, ListLocalAuthoritiesResponse>();

        httpCode.EnsureSuccessStatusCode();
        httpCode.StatusCode.ShouldBe(HttpStatusCode.OK);

        response.LocalAuthorities.Count.ShouldBe(6);
        response.LocalAuthorities.Select(x => x.DisplayName).ShouldBe(
            ["Cheshire", "Leeds", "Liverpool", "Manchester", "Sheffield", "York"]);
    }

    [Fact]
    public async Task ListLocalAuthorities_IncludesCodesAndRegionData()
    {
        var (_, response) =
            await app.Client.GETAsync<ListLocalAuthoritiesEndpoint, ListLocalAuthoritiesResponse>();

        var liverpool = response.LocalAuthorities.Single(x => x.Code == "E08000014");
        liverpool.DisplayName.ShouldBe("Liverpool");
        liverpool.RegionCode.ShouldBe("E12000002");
        liverpool.RegionName.ShouldBe("North West");

        foreach (var la in response.LocalAuthorities)
        {
            la.Code.ShouldNotBeNullOrWhiteSpace();
            la.DisplayName.ShouldNotBeNullOrWhiteSpace();
            la.RegionCode.ShouldNotBeNullOrWhiteSpace();
            la.RegionName.ShouldNotBeNullOrWhiteSpace();
        }
    }
}
