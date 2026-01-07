using api.Endpoints.MetricFilters;
using api.Tests.Fixtures;
using FastEndpoints;
using Shouldly;
using System.Net;

namespace api.Tests.Endpoints.MetricFilters;

public class GetMetricFiltersEndpointTests : IClassFixture<IntegrationTestFixture>
{
    private readonly HttpClient _client;

    public GetMetricFiltersEndpointTests(IntegrationTestFixture fixture)
    {
        var factory = new CustomWebAppFactory(fixture.PostgresContainer);
        _client = factory.CreateClient();
    }

    [Fact]
    public async Task GetMetricFilters_ReturnsOk()
    {
        var (httpCode, _) =
            await _client.GETAsync<GetMetricFiltersEndpoint, GetMetricFiltersRequest, GetMetricFiltersResponse>(
                new GetMetricFiltersRequest { MetricGroupCode = "metric_group_code" });
        httpCode.EnsureSuccessStatusCode();
        httpCode.StatusCode.ShouldBe(HttpStatusCode.OK);
    }

    [Fact]
    public async Task GetMetricFilters_ReturnsTwoExpectedFilters()
    {
        var (httpCode, response) =
            await _client.GETAsync<GetMetricFiltersEndpoint, GetMetricFiltersRequest, GetMetricFiltersResponse>(
                new GetMetricFiltersRequest { MetricGroupCode = "metric_group_code" });
        httpCode.EnsureSuccessStatusCode();
        httpCode.StatusCode.ShouldBe(HttpStatusCode.OK);
        response.MetricGroupCode.ShouldBe("metric_group_code");
        List<GetMetricFiltersResponse.MetricFilterDto> expectedMetricFilters = new()
        {
            new GetMetricFiltersResponse.MetricFilterDto() { MetricCode = "metric_code", DisplayName = "Metric" },
            new GetMetricFiltersResponse.MetricFilterDto()
            {
                MetricCode = "metric_code_2", DisplayName = "Metric 2"
            },
        };
        response.MetricFilters.ShouldBe(expectedMetricFilters);
    }

    [Fact]
    public async Task GetMetricFilters_ReturnsSingleExpectedFilter()
    {
        var (httpCode, response) =
            await _client.GETAsync<GetMetricFiltersEndpoint, GetMetricFiltersRequest, GetMetricFiltersResponse>(
                new GetMetricFiltersRequest { MetricGroupCode = "metric_group_code_2" });
        httpCode.EnsureSuccessStatusCode();
        httpCode.StatusCode.ShouldBe(HttpStatusCode.OK);
        response.MetricGroupCode.ShouldBe("metric_group_code_2");
        List<GetMetricFiltersResponse.MetricFilterDto> expectedMetricFilters = new()
        {
            new GetMetricFiltersResponse.MetricFilterDto()
            {
                MetricCode = "metric_code_3", DisplayName = "Metric 3"
            },
        };
        response.MetricFilters.ShouldBe(expectedMetricFilters);
    }

    [Fact]
    public async Task GetUnknownMetricFilters_Returns404()
    {
        var (httpCode, _) = await _client.GETAsync<GetMetricFiltersEndpoint, GetMetricFiltersRequest, GetMetricFiltersResponse>(
            new GetMetricFiltersRequest { MetricGroupCode = "unknown_metric_group_code" });
        httpCode.StatusCode.ShouldBe(HttpStatusCode.NotFound);
    }

    // 200 metric group with no metrics
    // JSON check
    // non-existent metric group code
    // invalid metric group code
}