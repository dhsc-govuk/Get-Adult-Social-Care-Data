using FastEndpoints;
using gascd_api.Properties.Features.Geo.Postcode;
using Shouldly;
using System.Net;

namespace gascd_api.Tests.Properties.Features;

public class AuthTests : IClassFixture<IntegrationTestFixture>
{
    private readonly HttpClient _client;
    
    public AuthTests(IntegrationTestFixture fixture)
    {
        var factory = new CustomWebAppFactory(fixture.PostgresContainer);
        _client = factory.CreateClient();
        _client.DefaultRequestHeaders.Remove("x-api-key");
    }

    [Fact]
    public async Task UnAuthorisedAccess_ResultsInError()
    {
        var (httpCode, _) = await _client.GETAsync<GetPostcodeEndpoint, GetPostcodeRequest, GetPostcodeResponse>(
            new GetPostcodeRequest { Postcode = "KT220UF" });
        httpCode.StatusCode.ShouldBe(HttpStatusCode.Unauthorized);
    }
    


}
