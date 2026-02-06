using api.Endpoints.Geo.Postcode;
using FastEndpoints;
using FastEndpoints.Testing;
using Shouldly;
using System.Net;

namespace api.Tests.Endpoints;

public class AuthTests(App app) : TestBase<App>
{
    [Fact]
    public async Task UnauthorisedAccess_ResultsInError()
    {
        app.Client.DefaultRequestHeaders.Remove("x-api-key");
        var (httpCode, _) = await app.Client.GETAsync<GetPostcodeEndpoint, GetPostcodeRequest, GetPostcodeResponse>(
            new GetPostcodeRequest { Postcode = "KT220UF" });
        httpCode.StatusCode.ShouldBe(HttpStatusCode.Unauthorized);
    }

    [Fact]
    public async Task BadApiKey_ResultsInError()
    {
        app.Client.DefaultRequestHeaders.Remove("x-api-key");
        app.Client.DefaultRequestHeaders.Add("x-api-key", "bad-api-key");

        var (httpCode, _) = await app.Client.GETAsync<GetPostcodeEndpoint, GetPostcodeRequest, GetPostcodeResponse>(
            new GetPostcodeRequest { Postcode = "KT220UF" });
        httpCode.StatusCode.ShouldBe(HttpStatusCode.Unauthorized);
    }
}