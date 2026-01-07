using api.Endpoints.Metrics;
using api.Endpoints.Metrics.Metadata;
using api.Tests.Fixtures;
using FastEndpoints;
using Shouldly;
using System.Net;

namespace api.Tests.Endpoints.Metrics;

public class GetMetricTests : IClassFixture<IntegrationTestFixture>
{
    private readonly HttpClient _client;

    public GetMetricTests(IntegrationTestFixture fixture)
    {
        var factory = new CustomWebAppFactory(fixture.PostgresContainer);
        _client = factory.CreateClient();
    }

    [Fact]
    public async Task GetMetric_ReturnsOk()
    {
        var (httpCode, _) =
            await _client.GETAsync<GetMetricEndpoint, GetMetricRequest, GetMetricResponse>(
                new GetMetricRequest { MetricCode = "metric_code", LocationCode = "location_code", LocationType = "location_type" });
        httpCode.EnsureSuccessStatusCode();
        httpCode.StatusCode.ShouldBe(HttpStatusCode.OK);
    }

    [Fact]
    public async Task GetMetric_ReturnsExpectedData()
    {
        var (httpCode, response) = await _client.GETAsync<GetMetricEndpoint, GetMetricRequest, GetMetricResponse>(
            new GetMetricRequest { MetricCode = "metric_code", LocationCode = "location_code", LocationType = "location_type" });

        httpCode.EnsureSuccessStatusCode();
        httpCode.StatusCode.ShouldBe(HttpStatusCode.OK);

        response.MetricCode.ShouldBe("metric_code");
        response.LocationCode.ShouldBe("location_code");
        response.LocationType.ShouldBe("location_type");
    }
}