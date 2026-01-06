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
                new GetMetricMetadataRequest { MetricCode = "metric_code" });
        httpCode.EnsureSuccessStatusCode();
        httpCode.StatusCode.ShouldBe(HttpStatusCode.OK);
    }

    [Fact]
    public async Task GetMetricMetadata_ReturnsExpectedMetricdata()
    {
        var (httpCode, response) =
            await _client.GETAsync<GetMetricMetadataEndpoint, GetMetricMetadataRequest, GetMetricMetadataResponse>(
                new GetMetricMetadataRequest { MetricCode = "metric_code" });
        httpCode.EnsureSuccessStatusCode();
        httpCode.StatusCode.ShouldBe(HttpStatusCode.OK);
        response.MetricCode.ShouldBe("metric_code");
        response.MetricName.ShouldBe("Metric");
        response.DataType.ShouldBe("numbers");
        response.DataSource.ShouldBe("ONS");
        response.Numerator.ShouldBe("This is a numerator");
        response.Denominator.ShouldBe("This is a denominator");
    }

}