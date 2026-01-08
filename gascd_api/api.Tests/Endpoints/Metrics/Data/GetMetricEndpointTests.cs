using api.Endpoints.Metrics.Data;
using api.Tests.Fixtures;
using FastEndpoints;
using Shouldly;
using System.Net;

namespace api.Tests.Endpoints.Metrics.Data;

public class GetMetricEndpointTests : IClassFixture<IntegrationTestFixture>
{
    private readonly HttpClient _client;

    public GetMetricEndpointTests(IntegrationTestFixture fixture)
    {
        var factory = new CustomWebAppFactory(fixture.PostgresContainer);
        _client = factory.CreateClient();
    }

    [Fact]
    public async Task GetMetric_ReturnsOk()
    {
        var (httpCode, _) =
            await _client.GETAsync<GetMetricEndpoint, GetMetricRequest, GetMetricResponse>(
                new GetMetricRequest { MetricCode = "bedcount", LocationCode = "1-123456789", LocationType = "Regional" });
        httpCode.EnsureSuccessStatusCode();
        httpCode.StatusCode.ShouldBe(HttpStatusCode.OK);
    }

    [Fact]
    public async Task GetMetric_Bedcount_ReturnsExpectedData()
    {
        var (httpCode, response) = await _client.GETAsync<GetMetricEndpoint, GetMetricRequest, GetMetricResponse>(
            new GetMetricRequest { MetricCode = "bedcount", LocationCode = "1-123456789", LocationType = "Regional" });

        httpCode.EnsureSuccessStatusCode();
        httpCode.StatusCode.ShouldBe(HttpStatusCode.OK);

        response.MetricCode.ShouldBe("bedcount");
        response.LocationCode.ShouldBe("1-123456789");
        response.LocationType.ShouldBe("Regional");
        response.SeriesStartDate.ShouldBe(new DateTime(2000, 01, 01));
        response.SeriesFrequency.ShouldBe("Daily");
        response.Values.ShouldBe([5.5m]);
    }

    [Fact]
    public async Task GetMetric_Bedcount_AnotherLocationReturnsExpectedData()
    {
        var (httpCode, response) = await _client.GETAsync<GetMetricEndpoint, GetMetricRequest, GetMetricResponse>(
            new GetMetricRequest { MetricCode = "bedcount", LocationCode = "E92000001", LocationType = "National" });

        httpCode.EnsureSuccessStatusCode();
        httpCode.StatusCode.ShouldBe(HttpStatusCode.OK);

        response.MetricCode.ShouldBe("bedcount");
        response.LocationCode.ShouldBe("E92000001");
        response.LocationType.ShouldBe("National");
        response.SeriesStartDate.ShouldBe(new DateTime(2000, 01, 01));
        response.SeriesFrequency.ShouldBe("Daily");
        response.Values.ShouldBe([6.6m]);
    }

    [Fact]
    public async Task GetMetric_MedianBedCount_ReturnsExpectedData()
    {
        var (httpCode, response) = await _client.GETAsync<GetMetricEndpoint, GetMetricRequest, GetMetricResponse>(
            new GetMetricRequest { MetricCode = "median_bed_count", LocationCode = "E92000001", LocationType = "Regional" });

        httpCode.EnsureSuccessStatusCode();
        httpCode.StatusCode.ShouldBe(HttpStatusCode.OK);

        response.MetricCode.ShouldBe("median_bed_count");
        response.LocationCode.ShouldBe("E92000001");
        response.LocationType.ShouldBe("Regional");
        response.SeriesStartDate.ShouldBe(new DateTime(2001, 01, 01));
        response.SeriesFrequency.ShouldBe("Monthly");
        response.Values.ShouldBe([6.6m]);
    }



}