using api.Endpoints.MetricLocation.CpLocations;
using api.Tests.Fixtures;
using FastEndpoints;
using Newtonsoft.Json.Linq;
using Shouldly;
using System.Net;
using static api.Tests.Fixtures.TestUtils;

namespace api.Tests.Endpoints.MetricLocations.CPLocations;

public class GetCareProviderLocationEndpointTests : IClassFixture<IntegrationTestFixture>
{
    private readonly HttpClient _client;

    public GetCareProviderLocationEndpointTests(IntegrationTestFixture fixture)
    {
        var factory = new CustomWebAppFactory(fixture.PostgresContainer);
        _client = factory.CreateClient();
    }

    [Fact]
    public async Task GetCareProviderLocation_ReturnsOk()
    {
        var (httpCode, _) =
            await _client.GETAsync<GetCareProviderLocationEndpoint, GetCareProviderLocationRequest, GetCareProviderLocationResponse>(
                new GetCareProviderLocationRequest { CareProviderLocationCode = "1-222222222" });
        httpCode.EnsureSuccessStatusCode();
        httpCode.StatusCode.ShouldBe(HttpStatusCode.OK);
    }

    [Fact]
    public async Task GetCareProviderLocation_ReturnsExpectedCareProviderData()
    {
        var (httpCode, response) =
            await _client.GETAsync<GetCareProviderLocationEndpoint, GetCareProviderLocationRequest, GetCareProviderLocationResponse>(
                new GetCareProviderLocationRequest { CareProviderLocationCode = "1-222222222" });
        httpCode.EnsureSuccessStatusCode();
        httpCode.StatusCode.ShouldBe(HttpStatusCode.OK);
        response.Id.ShouldBe("1-222222222");
        response.DisplayName.ShouldBe("Bupa Liverpool");
        response.Address.ShouldBe("Bupa Liverpool, CV2 2TN");
        response.ProviderId.ShouldBe("1-123456789");
        response.ProviderName.ShouldBe("Bupa");
        response.NominatedIndividual.ShouldBe("Mr. Ice Cool");
        response.LocalAuthorityId.ShouldBe("E08000014");
    }

    [Fact]
    public async Task GetCareProviderLocation_ReturnsExpectedCareProviderJsonObject()
    {
        var response = await _client.GetAsync("api/metric_locations/cp_locations/1-222222222", TestContext.Current.CancellationToken);
        response.StatusCode.ShouldBe(HttpStatusCode.OK);
        var jsonArray = await ParseJsonResponse<JObject>(response);
        GetFromJson(jsonArray, "id").ShouldBe("1-222222222");
        GetFromJson(jsonArray, "display_name").ShouldBe("Bupa Liverpool");
        GetFromJson(jsonArray, "address").ShouldBe("Bupa Liverpool, CV2 2TN");
        GetFromJson(jsonArray, "provider_id").ShouldBe("1-123456789");
        GetFromJson(jsonArray, "provider_name").ShouldBe("Bupa");
        GetFromJson(jsonArray, "nominated_individual").ShouldBe("Mr. Ice Cool");
        GetFromJson(jsonArray, "local_authority_id").ShouldBe("E08000014");

    }

    [Theory]
    [InlineData("1-", "Care provider location code has a minimum length of 3")]
    [InlineData("1-1234232323232344233324324", "Care provider location code has a maximum length of 15")]
    public async Task Invalid_CareProviderLocationCode_Input(string careProviderLocationCode, string expectedErrorMessage)
    {
        var (httpResponse, problemDetails) =
            await _client.GETAsync<GetCareProviderLocationEndpoint, GetCareProviderLocationRequest, ProblemDetails>(
                new GetCareProviderLocationRequest { CareProviderLocationCode = careProviderLocationCode });
        httpResponse.StatusCode.ShouldBe(HttpStatusCode.BadRequest);
        problemDetails.Errors.Count().ShouldBe(1);
        problemDetails.Errors.Select(e => e.Name).ShouldBe(["care_provider_location_code"]);
        problemDetails.Errors.Select(e => e.Reason).ShouldBe([expectedErrorMessage]);
    }







}