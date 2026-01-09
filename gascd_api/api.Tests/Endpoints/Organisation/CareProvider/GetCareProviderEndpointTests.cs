using api.Endpoints.Organisation.CareProvider;
using api.Tests.Fixtures;
using FastEndpoints;
using Newtonsoft.Json.Linq;
using Shouldly;
using System.Net;
using static api.Tests.Fixtures.TestUtils;

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
            await _client.GETAsync<GetCareProviderEndpoint, GetCareProviderRequest, GetCareProviderResponse>(
                new GetCareProviderRequest { CareProviderCode = "1-123456789" });
        httpCode.EnsureSuccessStatusCode();
        httpCode.StatusCode.ShouldBe(HttpStatusCode.OK);
    }

    [Fact]
    public async Task GetCareProvider_ReturnsExpectedCareProviderData()
    {
        var validCareProviderCode = "1-123456789";
        var (httpCode, response) =
            await _client.GETAsync<GetCareProviderEndpoint, GetCareProviderRequest, GetCareProviderResponse>(
                new GetCareProviderRequest { CareProviderCode = validCareProviderCode });
        httpCode.EnsureSuccessStatusCode();
        httpCode.StatusCode.ShouldBe(HttpStatusCode.OK);
        response.DisplayName.ShouldBe("Bupa");
        response.Locations.ShouldNotBeEmpty();
        response.Locations.Count.ShouldBe(1);
        response.Locations[0].LocationName.ShouldBe("Bupa Liverpool");
        response.Locations[0].LocationCode.ShouldBe("1-222222222");

    }

    [Fact]
    public async Task GetCareProvider_ReturnsExpectedCareProviderJsonObject()
    {
        var response = await _client.GetAsync("api/organisation/care_provider/1-123456789", TestContext.Current.CancellationToken);
        response.StatusCode.ShouldBe(HttpStatusCode.OK);

        var jObject = await ParseJsonResponse<JObject>(response);
        GetFromJson(jObject, "display_name").ShouldBe("Bupa");
        GetFromJson(jObject, "locations[0].location_name").ShouldBe("Bupa Liverpool");
        GetFromJson(jObject, "locations[0].location_code").ShouldBe("1-222222222");
    }

    [Fact]
    public async Task GetCareProvider_ReturnsErrorWhenProvidedWhiteSpace()
    {
        HttpResponseMessage response = await _client.GetAsync("api/organisation/care_provider/ /", TestContext.Current.CancellationToken);
        response.StatusCode.ShouldBe(HttpStatusCode.BadRequest);

        JObject? json = await ParseJsonResponse<JObject>(response);
        GetFromJson(json, "errors[0].name").ShouldBe("care_provider_code");
        GetFromJson(json, "errors[0].reason").ShouldBe("Care provider code is required");
    }

    [Fact]
    public async Task GetCareProvider_ReturnsMultipleCareProviderLocations()
    {
        var idForCareProvideWith2Locations = "1-123456777";
        var (httpCode, response) =
            await _client.GETAsync<GetCareProviderEndpoint, GetCareProviderRequest, GetCareProviderResponse>(
                new GetCareProviderRequest { CareProviderCode = idForCareProvideWith2Locations });
        httpCode.EnsureSuccessStatusCode();
        httpCode.StatusCode.ShouldBe(HttpStatusCode.OK);
        response.DisplayName.ShouldBe("Katherine");
        response.Locations.ShouldNotBeEmpty();
        response.Locations.Count.ShouldBe(2);
        response.Locations.ShouldContain(o => o.LocationName == "Katherines Teeth" && o.LocationCode == "1-222222223" && o.Address == "Katherines Teeth, Liverpool, ME10 1QX");
        response.Locations.ShouldContain(o => o.LocationName == "Katherines Eyes" && o.LocationCode == "1-222222224" && o.Address == "Katherines Eyes, Liverpool, ME10 1QY");
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
            await _client.GETAsync<GetCareProviderEndpoint, GetCareProviderRequest, GetCareProviderResponse>(
                new GetCareProviderRequest { CareProviderCode = codeForCareProviderWithNoLocations });
        httpCode.EnsureSuccessStatusCode();
        httpCode.StatusCode.ShouldBe(HttpStatusCode.OK);
        response.Locations.Count.ShouldBe(0);
    }

}