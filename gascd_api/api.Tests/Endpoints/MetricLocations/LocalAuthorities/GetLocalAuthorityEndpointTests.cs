using api.Endpoints.MetricLocation.LocalAuthorities;
using api.Tests.Fixtures;
using FastEndpoints;
using Shouldly;
using System.Net;

namespace api.Tests.Endpoints.MetricLocations.LocalAuthorities;

public class GetLocalAuthorityEndpointTests : IClassFixture<IntegrationTestFixture>
{
    private readonly HttpClient _client;

    public GetLocalAuthorityEndpointTests(IntegrationTestFixture fixture)
    {
        var factory = new CustomWebAppFactory(fixture.PostgresContainer);
        _client = factory.CreateClient();
    }

    [Fact]
    public async Task GetLocalAuthority_ReturnsOk()
    {
        var (httpCode, _) =
            await _client.GETAsync<GetLocalAuthorityEndpoint, GetLocalAuthorityRequest, GetLocalAuthorityResponse>(
                new GetLocalAuthorityRequest { LocalAuthorityCode = "code" });
        httpCode.EnsureSuccessStatusCode();
        httpCode.StatusCode.ShouldBe(HttpStatusCode.OK);
    }
}