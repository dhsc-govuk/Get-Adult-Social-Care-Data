using api.Endpoints.MetricLocation.CpLocations;
using api.Tests.Fixtures;
using FastEndpoints;
using Shouldly;
using System.Net;

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




}