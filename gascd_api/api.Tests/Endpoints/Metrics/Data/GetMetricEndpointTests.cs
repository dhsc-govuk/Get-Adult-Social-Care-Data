using api.Endpoints.Metrics.Data;
using api.Tests.Fixtures;
using FastEndpoints;
using Newtonsoft.Json.Linq;
using Shouldly;
using System.Net;
using static api.Tests.Fixtures.TestUtils;

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
                new GetMetricRequest { MetricCode = MetricCodeEnum.bedcount, LocationCode = "1-123456789", LocationType = "National" });
        httpCode.EnsureSuccessStatusCode();
        httpCode.StatusCode.ShouldBe(HttpStatusCode.OK);
    }

    [Fact]
    public async Task GetMetric_Bedcount_ReturnsExpectedData()
    {
        var (httpCode, response) = await _client.GETAsync<GetMetricEndpoint, GetMetricRequest, GetMetricResponse>(
            new GetMetricRequest { MetricCode = MetricCodeEnum.bedcount, LocationCode = "1-123456789", LocationType = "National" });

        httpCode.EnsureSuccessStatusCode();
        httpCode.StatusCode.ShouldBe(HttpStatusCode.OK);

        response.MetricCode.ShouldBe("bedcount");
        response.LocationCode.ShouldBe("1-123456789");
        response.LocationType.ShouldBe("National");
        response.SeriesStartDate.ShouldBe(new DateTime(2000, 01, 01));
        response.SeriesFrequency.ShouldBe("Daily");
        response.Values.ShouldBe([5.5m]);
    }

    [Fact]
    public async Task GetMetric_Bedcount_AnotherLocationReturnsExpectedData()
    {
        var (httpCode, response) = await _client.GETAsync<GetMetricEndpoint, GetMetricRequest, GetMetricResponse>(
            new GetMetricRequest { MetricCode = MetricCodeEnum.bedcount, LocationCode = "E92000001", LocationType = "Regional" });

        httpCode.EnsureSuccessStatusCode();
        httpCode.StatusCode.ShouldBe(HttpStatusCode.OK);

        response.MetricCode.ShouldBe("bedcount");
        response.LocationCode.ShouldBe("E92000001");
        response.LocationType.ShouldBe("Regional");
        response.SeriesStartDate.ShouldBe(new DateTime(2001, 01, 01));
        response.SeriesFrequency.ShouldBe("Daily");
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

    [Fact]
    public async Task GetMetric_NonExistent_MetricCodeInput()
    {
        var response = await _client.GetAsync("api/metrics/nonexistent/data", TestContext.Current.CancellationToken);
        response.StatusCode.ShouldBe(HttpStatusCode.BadRequest);

        JObject? json = await ParseJsonResponse<JObject>(response);
        GetFromJson(json, "errors[0].name").ShouldBe("metric_code");
        GetFromJson(json, "errors[0].reason").ShouldBe("Value [nonexistent] is not valid for a [MetricCodeEnum] property!");
    }


    [Theory]
    [MemberData(nameof(MetricCodeTimeSeriesCombinations))]
    public async Task GetMetric_EachMetricCode_ReturnsExpectedData(MetricCodeEnum metricCode, decimal lastValue)
    {
        var (httpCode, response) = await _client.GETAsync<GetMetricEndpoint, GetMetricRequest, GetMetricResponse>(
            new GetMetricRequest { MetricCode = metricCode, LocationCode = "E92000001", LocationType = "Regional" });

        httpCode.EnsureSuccessStatusCode();
        httpCode.StatusCode.ShouldBe(HttpStatusCode.OK);
        response.MetricCode.ShouldBe(metricCode.ToString());
        response.LocationCode.ShouldBe("E92000001");
        response.LocationType.ShouldBe("Regional");
        response.SeriesStartDate.ShouldBe(new DateTime(2001, 01, 01));
        response.SeriesFrequency.ShouldBe("Daily");
        response.Values.ShouldBe([lastValue]);
    }

    public static IEnumerable<object[]> MetricCodeTimeSeriesCombinations
    {
        get
        {
            yield return [MetricCodeEnum.bedcount, 6.6m];
            yield return [MetricCodeEnum.bedcount_per_hundred_thousand_adults, 6.7m];
            yield return [MetricCodeEnum.dementia_estimated_diagnosis_rate_65over, 6.8m];
            yield return [MetricCodeEnum.dementia_prevalence_65over, 6.9m];
            yield return [MetricCodeEnum.dementia_qof_prevalence, 6.11m];
            yield return [MetricCodeEnum.dementia_register_65over_per100k, 6.12m];
            yield return [MetricCodeEnum.learning_disability_prevalence, 6.13m];
            yield return [MetricCodeEnum.median_bed_count, 6.6m];
            yield return [MetricCodeEnum.median_occupancy, 6.15m];
            yield return [MetricCodeEnum.occupancy_rates, 6.16m];
            yield return [MetricCodeEnum.perc_18_64, 6.17m];
            yield return [MetricCodeEnum.perc_65over, 6.18m];
            yield return [MetricCodeEnum.perc_75over, 6.19m];
            yield return [MetricCodeEnum.perc_85over, 6.21m];
            yield return [MetricCodeEnum.perc_general_health, 6.22m];
            yield return [MetricCodeEnum.perc_household_ownership, 6.23m];
            yield return [MetricCodeEnum.perc_households_deprivation_deprived, 6.24m];
            yield return [MetricCodeEnum.perc_households_one_person, 6.25m];
            yield return [MetricCodeEnum.perc_population_disability, 6.26m];
            yield return [MetricCodeEnum.perc_unpaid_care_provider, 6.27m];
            yield return [MetricCodeEnum.total_population, 6.28m];

        }


    }


}