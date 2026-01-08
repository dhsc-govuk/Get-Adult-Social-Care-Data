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
                new GetMetricRequest { MetricCode = MetricCodeEnum.bedcount, LocationCode = "1-123456789", LocationType = "Regional" });
        httpCode.EnsureSuccessStatusCode();
        httpCode.StatusCode.ShouldBe(HttpStatusCode.OK);
    }

    [Fact]
    public async Task GetMetric_Bedcount_ReturnsExpectedData()
    {
        var (httpCode, response) = await _client.GETAsync<GetMetricEndpoint, GetMetricRequest, GetMetricResponse>(
            new GetMetricRequest { MetricCode = MetricCodeEnum.bedcount, LocationCode = "1-123456789", LocationType = "Regional" });

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
            new GetMetricRequest { MetricCode = MetricCodeEnum.bedcount, LocationCode = "E92000001", LocationType = "National" });

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
            new GetMetricRequest { MetricCode = MetricCodeEnum.median_bed_count, LocationCode = "E92000001", LocationType = "Regional" });

        httpCode.EnsureSuccessStatusCode();
        httpCode.StatusCode.ShouldBe(HttpStatusCode.OK);

        response.MetricCode.ShouldBe("median_bed_count");
        response.LocationCode.ShouldBe("E92000001");
        response.LocationType.ShouldBe("Regional");
        response.SeriesStartDate.ShouldBe(new DateTime(2001, 01, 01));
        response.SeriesFrequency.ShouldBe("Monthly");
        response.Values.ShouldBe([6.6m]);
    }

    [Theory]
    [MemberData(nameof(MetricCodeNonexistentLocationCodeTypeCombinations))]
    public async Task GetMetric_NonExistentTimeSeries_Returns404(MetricCodeEnum metricCode, string locationCode, string locationType)
    {
        var (httpCode, response) = await _client.GETAsync<GetMetricEndpoint, GetMetricRequest, GetMetricResponse>(
            new GetMetricRequest { MetricCode = metricCode, LocationCode = locationCode, LocationType = locationType });
        httpCode.StatusCode.ShouldBe(HttpStatusCode.NotFound);
    }

    public static IEnumerable<object[]> MetricCodeNonexistentLocationCodeTypeCombinations
    {
        get
        {
            foreach (var code in Enum.GetValues(typeof(MetricCodeEnum)))
            {
                yield return [code, "nonexistent", "Regional"];
                yield return [code, "E92000001", "nonexistent"];
            }
        }
    }

    [Theory]
    [MemberData(nameof(MetricCodeLocationCombinations))]
    public async Task GetMetric_Invalid_LocationCode_Input(MetricCodeEnum metricCode, string locationCode, string expectedErrorMessage)
    {
        var (httpResponse, problemDetails) =
            await _client.GETAsync<GetMetricEndpoint, GetMetricRequest, ProblemDetails>(
                new GetMetricRequest { MetricCode = metricCode, LocationCode = locationCode, LocationType = "Regional" });
        httpResponse.StatusCode.ShouldBe(HttpStatusCode.BadRequest);
        problemDetails.Errors.Count().ShouldBe(1);
        problemDetails.Errors.Select(e => e.Name).ShouldBe(["location_code"]);
        problemDetails.Errors.Select(e => e.Reason).ShouldBe([expectedErrorMessage]);
    }

    public static IEnumerable<object[]> MetricCodeLocationCombinations
    {
        get
        {
            foreach (var code in Enum.GetValues(typeof(MetricCodeEnum)))
            {
                yield return [code, " ", "Location code is required"];
                yield return [code, "1-", "Location code has a minimum length of 3"];
                yield return [code, "1-12345678910112", "Location code has a maximum length of 15"];
            }
        }
    }
}