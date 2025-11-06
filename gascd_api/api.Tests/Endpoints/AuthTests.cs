using api.Endpoints.Geo.Postcode;
using api.Tests.Fixtures;
using FastEndpoints;
using Shouldly;
using System.Net;

namespace api.Tests.Endpoints;

public class AuthTests(IntegrationTestFixture fixture) : IClassFixture<IntegrationTestFixture>
{
    CustomWebAppFactory factory = new CustomWebAppFactory(fixture.PostgresContainer);

    [Fact]
    public async Task UnauthorisedAccess_ResultsInError()
    {

        var client = factory.CreateClient();
        client.DefaultRequestHeaders.Remove("x-api-key");
        var (httpCode, _) = await client.GETAsync<GetPostcodeEndpoint, GetPostcodeRequest, GetPostcodeResponse>(
            new GetPostcodeRequest { Postcode = "KT220UF" });
        httpCode.StatusCode.ShouldBe(HttpStatusCode.Unauthorized);
    }

    [Fact]
    public async Task BadApiKey_ResultsInError()
    {
        var client = factory.CreateClient();
        client.DefaultRequestHeaders.Remove("x-api-key");
        client.DefaultRequestHeaders.Add("x-api-key", "bad-api-key");

        var (httpCode, _) = await client.GETAsync<GetPostcodeEndpoint, GetPostcodeRequest, GetPostcodeResponse>(
            new GetPostcodeRequest { Postcode = "KT220UF" });
        httpCode.StatusCode.ShouldBe(HttpStatusCode.Unauthorized);
    }


}