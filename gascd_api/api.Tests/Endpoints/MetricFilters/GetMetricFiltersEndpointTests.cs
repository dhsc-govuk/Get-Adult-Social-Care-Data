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
    public async Task GetMetricFilters_ReturnsExpectedFilters()
    {
        var (httpCode, response) =
            await _client.GETAsync<GetMetricFiltersEndpoint, GetMetricFiltersRequest, GetMetricFiltersResponse>(
                new GetMetricFiltersRequest { MetricGroupCode = "metric_group_code" });
        httpCode.EnsureSuccessStatusCode();
        httpCode.StatusCode.ShouldBe(HttpStatusCode.OK);
        response.MetricGroupCode.ShouldBe("metric_group_code");
        List<GetMetricFiltersResponse.MetricFilterDto> expectedMetricFilters = new()
        {
            new GetMetricFiltersResponse.MetricFilterDto() { MetricCode = "metric_code", DisplayName = "Metric"},
            new GetMetricFiltersResponse.MetricFilterDto() { MetricCode = "metric_code_2", DisplayName = "Metric 2"},
        };
        response.MetricFilters.ShouldBe(expectedMetricFilters);
    }
}