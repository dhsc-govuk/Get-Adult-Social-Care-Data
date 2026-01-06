using api.Endpoints.Metrics.Metadata;
using api.Tests.Fixtures;
using FastEndpoints;
using Shouldly;
using System.Net;

namespace api.Tests.Endpoints.Metrics.MetaData;

public class GetMetricMetadataTests : IClassFixture<IntegrationTestFixture>
{
    private readonly HttpClient _client;

    public GetMetricMetadataTests(IntegrationTestFixture fixture)
    {
        var factory = new CustomWebAppFactory(fixture.PostgresContainer);
        _client = factory.CreateClient();
    }

    [Fact]
    public async Task GetMetricMetadata_ReturnsOk()
    {
        var (httpCode, _) =
            await _client.GETAsync<GetMetricMetadataEndpoint, GetMetricMetadataRequest, GetMetricMetadataResponse>(
                new GetMetricMetadataRequest { MetricId = "123" });
        httpCode.EnsureSuccessStatusCode();
        httpCode.StatusCode.ShouldBe(HttpStatusCode.OK);
    }
}