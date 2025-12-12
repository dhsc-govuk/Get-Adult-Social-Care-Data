using api.Endpoints.Organisation.CareProvider;
using api.Tests.Fixtures;
using FastEndpoints;
using Newtonsoft.Json.Linq;
using Shouldly;
using System.Net;

namespace api.Tests.Endpoints.Organisation.CareProvider;

public class GetCareProviderEndpointTests : IClassFixture<IntegrationTestFixture>
{
    private readonly HttpClient _client;

    public GetCareProviderEndpointTests(IntegrationTestFixture fixture)
    {
        var factory = new CustomWebAppFactory(fixture.PostgresContainer);
        _client = factory.CreateClient();
    }

    [Fact]
    public async Task GetCareProvider_ReturnsOk()
    {
        var (httpCode, _) =
            await _client.GETAsync<GetCareProviderEndpoint, GetCareProviderRequest, List<GetCareProviderResponse>>(
                new GetCareProviderRequest { CareProviderCode = "1-123456789" });
        httpCode.EnsureSuccessStatusCode();
        httpCode.StatusCode.ShouldBe(HttpStatusCode.OK);
    }

    [Fact]
    public async Task GetCareProvider_ReturnsExpectedCareProviderData()
    {
        var (httpCode, response) =
            await _client.GETAsync<GetCareProviderEndpoint, GetCareProviderRequest, List<GetCareProviderResponse>>(
                new GetCareProviderRequest { CareProviderCode = "1-123456789" });
        httpCode.EnsureSuccessStatusCode();
        httpCode.StatusCode.ShouldBe(HttpStatusCode.OK);
        response.ShouldNotBeEmpty();
        response.Count.ShouldBe(1);
        response[0].LocationName.ShouldBe("Bupa Liverpool");
        response[0].LocationId.ShouldBe("1-222222222");

    }

    [Fact]
    public async Task GetCareProvider_ReturnsExpectedCareProviderJsonObject()
    {
        var response = await _client.GetAsync("api/organisation/care_provider/1-123456789", TestContext.Current.CancellationToken);
        var jsonArray = await TestUtils.ParseJsonResponse<JArray>(response);
        response.StatusCode.ShouldBe(HttpStatusCode.OK);

        jsonArray?[0]["location_name"]?.Value<string>().ShouldBe("Bupa Liverpool");
        jsonArray?[0]["location_id"]?.Value<string>().ShouldBe("1-222222222");
    }

    [Fact]
    public async Task GetCareProvider_ReturnsErrorWhenProvidedWhiteSpace()
    {
        var response = await _client.GetAsync("api/organisation/care_provider/ /", TestContext.Current.CancellationToken);
        response.StatusCode.ShouldBe(HttpStatusCode.BadRequest);
        var jsonObject = await TestUtils.ParseJsonResponse<JObject>(response);
        jsonObject?["errors.[0].reason"]?.Value<string>().ShouldBe("Care provider code is required");
        jsonObject?["errors.[0].name"]?.Value<string>().ShouldBe("care_provider_code");

    }

    [Fact]
    public async Task GetCareProvider_ReturnsMultipleCareProviderLocations()
    {
        var (httpCode, response) =
            await _client.GETAsync<GetCareProviderEndpoint, GetCareProviderRequest, List<GetCareProviderResponse>>(
                new GetCareProviderRequest { CareProviderCode = "1-123456777" });
        httpCode.EnsureSuccessStatusCode();
        httpCode.StatusCode.ShouldBe(HttpStatusCode.OK);
        response.ShouldNotBeEmpty();
        response.Count.ShouldBe(2);
        response.ShouldContain(o => o.LocationName == "Katherines Teeth" && o.LocationId == "1-222222223");
        response.ShouldContain(o => o.LocationName == "Katherines Eyes" && o.LocationId == "1-222222224");
    }

    [Theory]
    [InlineData("1-", "Care provider code has a minimum length of 3")]
    [InlineData("1-12345678910111", "Care provider code has a maximum length of 15")]
    public async Task Invalid_CareProviderCode_Input(string careProviderCode, string expectedErrorMessage)
    {
        var (httpResponse, problemDetails) =
            await _client.GETAsync<GetCareProviderEndpoint, GetCareProviderRequest, ProblemDetails>(
                new GetCareProviderRequest { CareProviderCode = careProviderCode });
        httpResponse.StatusCode.ShouldBe(HttpStatusCode.BadRequest);
        problemDetails.Errors.Count().ShouldBe(1);
        problemDetails.Errors.Select(e => e.Name).ShouldBe(["care_provider_code"]);
        problemDetails.Errors.Select(e => e.Reason).ShouldBe([expectedErrorMessage]);
    }

    [Fact]
    public async Task NonExistent_CareProviderCode_Input()
    {
        var (httpResponse, problemDetails) =
            await _client.GETAsync<GetCareProviderEndpoint, GetCareProviderRequest, ProblemDetails>(
                new GetCareProviderRequest { CareProviderCode = "1-123456" });
        httpResponse.StatusCode.ShouldBe(HttpStatusCode.NotFound);
    }

    [Fact]
    public async Task Existent_CareProviderCode_WithNoLocations()
    {
        var codeForCareProviderWithNoLocations = "1-123456712";
        var (httpCode, response) =
            await _client.GETAsync<GetCareProviderEndpoint, GetCareProviderRequest, List<GetCareProviderResponse>>(
                new GetCareProviderRequest { CareProviderCode = codeForCareProviderWithNoLocations });
        httpCode.EnsureSuccessStatusCode();
        httpCode.StatusCode.ShouldBe(HttpStatusCode.OK);
        response.Count.ShouldBe(0);
    }

}