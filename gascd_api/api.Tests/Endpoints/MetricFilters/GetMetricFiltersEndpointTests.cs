using api.Endpoints.MetricFilters;
using api.Tests.Fixtures;
using FastEndpoints;
using Newtonsoft.Json.Linq;
using Shouldly;
using System.Net;
using static api.Tests.Fixtures.TestUtils;

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
            new GetMetricFiltersResponse.MetricFilterDto() { MetricCode = "bedcount", DisplayName = "Bedcount" },
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
            new GetMetricFiltersResponse.MetricFilterDto
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

    [Fact]
    public async Task GetMetricFilters_WithNoFilters()
    {
        var (httpCode, response) = await _client.GETAsync<GetMetricFiltersEndpoint, GetMetricFiltersRequest, GetMetricFiltersResponse>(
            new GetMetricFiltersRequest { MetricGroupCode = "metric_group_code_3" });
        httpCode.EnsureSuccessStatusCode();
        httpCode.StatusCode.ShouldBe(HttpStatusCode.OK);
        response.MetricGroupCode.ShouldBe("metric_group_code_3");
        response.MetricFilters.ShouldBeEmpty();
    }

    [Fact]
    public async Task GetMetricFilters_ReturnsExpectedJsonObject()
    {
        var response = await _client.GetAsync("/api/metric_filters/metric_group_code_2", TestContext.Current.CancellationToken);
        response.EnsureSuccessStatusCode();
        response.StatusCode.ShouldBe(HttpStatusCode.OK);

        var jObject = await ParseJsonResponse<JObject>(response);
        GetFromJson(jObject, "metric_group_code").ShouldBe("metric_group_code_2");
        GetFromJson(jObject, "metric_filters[0].metric_code").ShouldBe("metric_code_3");
        GetFromJson(jObject, "metric_filters[0].display_name").ShouldBe("Metric 3");
    }

    [Fact]
    public async Task GetMetricFilters_ReturnsErrorWhenProvidedWhiteSpace()
    {
        var response = await _client.GetAsync("/api/metric_filters/ /", TestContext.Current.CancellationToken);
        response.StatusCode.ShouldBe(HttpStatusCode.BadRequest);

        JObject? json = await ParseJsonResponse<JObject>(response);
        GetFromJson(json, "errors[0].name").ShouldBe("metric_group_code");
        GetFromJson(json, "errors[0].reason").ShouldBe("Metric group code is required");
    }

    [Theory]
    [InlineData("WA", "Metric group code has a minimum length of 3")]
    [InlineData("this-is-a-very-long-group-code-without-any-possible-chance-of-being-valid-as-it-is-just-far-tooo-long", "Metric group code has a maximum length of 100")]
    public async Task Invalid_MetricGroupCode_Input(string metricGroupCode, string expectedErrorMessage)
    {
        var (httpResponse, problemDetails) =
            await _client.GETAsync<GetMetricFiltersEndpoint, GetMetricFiltersRequest, ProblemDetails>(
                new GetMetricFiltersRequest { MetricGroupCode = metricGroupCode });
        httpResponse.StatusCode.ShouldBe(HttpStatusCode.BadRequest);
        problemDetails.Errors.Count().ShouldBe(1);
        problemDetails.Errors.Select(e => e.Name).ShouldBe(["metric_group_code"]);
        problemDetails.Errors.Select(e => e.Reason).ShouldBe([expectedErrorMessage]);
    }
}