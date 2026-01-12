using api.Data.Shared;
using api.Endpoints.Metrics.Data;
using api.Tests.Fixtures;
using FastEndpoints;
using Newtonsoft.Json.Linq;
using Shouldly;
using System.Net;
using System.Text;
using static api.Data.Shared.LocationTypeEnum;
using static api.Data.Shared.MetricCodeEnum;
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
            await _client.POSTAsync<GetMetricEndpoint, GetMetricRequest, List<GetMetricResponse>>(
                new GetMetricRequest
                {
                    MetricCode = bedcount,
                    Locations = new()
                    {
                        new GetMetricRequest.Location { LocationCode = "1-123456789", LocationType = National }
                    }
                });
        httpCode.EnsureSuccessStatusCode();
        httpCode.StatusCode.ShouldBe(HttpStatusCode.OK);
    }

    [Fact]
    public async Task GetMetric_Bedcount_ReturnsExpectedData()
    {
        var (httpCode, response) =
            await _client.POSTAsync<GetMetricEndpoint, GetMetricRequest, List<GetMetricResponse>>(
                new GetMetricRequest
                {
                    MetricCode = bedcount,
                    Locations = new() { new GetMetricRequest.Location { LocationCode = "1-123456789", LocationType = National } }
                });

        httpCode.EnsureSuccessStatusCode();
        httpCode.StatusCode.ShouldBe(HttpStatusCode.OK);

        response.Count.ShouldBe(1);
        response[0].MetricCode.ShouldBe("bedcount");
        response[0].LocationCode.ShouldBe("1-123456789");
        response[0].LocationType.ShouldBe("National");
        response[0].SeriesStartDate.ShouldBe(new DateTime(2000, 01, 01));
        response[0].SeriesFrequency.ShouldBe("Daily");
        response[0].Values.ShouldBe([5.5m]);
    }

    [Fact]
    public async Task GetMetric_Bedcount_AnotherLocationReturnsExpectedData()
    {
        var (httpCode, response) = await _client.POSTAsync<GetMetricEndpoint, GetMetricRequest, List<GetMetricResponse>>(
            new GetMetricRequest
            {
                MetricCode = bedcount,
                Locations = new() { new GetMetricRequest.Location { LocationCode = "E92000001", LocationType = Regional } }
            });

        httpCode.EnsureSuccessStatusCode();
        httpCode.StatusCode.ShouldBe(HttpStatusCode.OK);

        response.Count.ShouldBe(1);
        response[0].MetricCode.ShouldBe("bedcount");
        response[0].LocationCode.ShouldBe("E92000001");
        response[0].LocationType.ShouldBe("Regional");
        response[0].SeriesStartDate.ShouldBe(new DateTime(2001, 01, 01));
        response[0].SeriesFrequency.ShouldBe("Daily");
        response[0].Values.ShouldBe([6.6m]);
    }


    [Theory]
    [MemberData(nameof(MetricCodeTimeSeriesCombinations))]
    public async Task GetMetric_NonExistentLocationCode_Returns404(MetricCodeEnum metricCode, decimal _)
    {
        var (httpCode, response) = await _client.POSTAsync<GetMetricEndpoint, GetMetricRequest, List<GetMetricResponse>>(
            new GetMetricRequest
            {
                MetricCode = metricCode,
                Locations = new() { new GetMetricRequest.Location { LocationCode = "nonexistent", LocationType = National } }
            });
        httpCode.StatusCode.ShouldBe(HttpStatusCode.NotFound);
    }

    [Theory]
    [MemberData(nameof(MetricCodeTimeSeriesCombinations))]
    public async Task GetMetric_NonExistentLocationType_Returns404(MetricCodeEnum metricCode, decimal _)
    {
        HttpContent content = new StringContent("[ { \"location_code\": \"E92000001\", \"location_type\": \"nonexistent\" } ]", Encoding.UTF8, "application/json");
        var response = await _client.PostAsync($"api/metrics/{metricCode}/data", content, TestContext.Current.CancellationToken);
        response.StatusCode.ShouldBe(HttpStatusCode.BadRequest);

        JObject? json = await ParseJsonResponse<JObject>(response);
        GetFromJson(json, "errors[0].name").ShouldBe("serializer_errors");
        GetFromJson(json, "errors[0].reason").ShouldStartWith("The JSON value could not be converted to api.Data.Shared.LocationTypeEnum.");
    }

    [Theory]
    [MemberData(nameof(MetricCodeLocationCombinations))]
    public async Task GetMetric_Invalid_LocationCode_Input(MetricCodeEnum metricCode, string locationCode, string expectedErrorMessage)
    {
        var (httpResponse, problemDetails) =
            await _client.POSTAsync<GetMetricEndpoint, GetMetricRequest, ProblemDetails>(
                new GetMetricRequest
                {
                    MetricCode = metricCode,
                    Locations = new() { new GetMetricRequest.Location { LocationCode = locationCode, LocationType = Regional } }
                });
        httpResponse.StatusCode.ShouldBe(HttpStatusCode.BadRequest);
        problemDetails.Errors.Count().ShouldBe(1);
        problemDetails.Errors.Select(e => e.Name).ShouldBe(["locations[0].location_code"]);
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
        HttpContent content = new StringContent("[ { \"location_code\": \"E92000001\", \"location_type\": 0 } ]", Encoding.UTF8, "application/json");
        var response = await _client.PostAsync("api/metrics/nonexistent/data", content, TestContext.Current.CancellationToken);
        response.StatusCode.ShouldBe(HttpStatusCode.BadRequest);

        JObject? json = await ParseJsonResponse<JObject>(response);
        GetFromJson(json, "errors[0].name").ShouldBe("metric_code");
        GetFromJson(json, "errors[0].reason").ShouldBe("Value [nonexistent] is not valid for a [MetricCodeEnum] property!");
    }


    [Theory]
    [MemberData(nameof(MetricCodeTimeSeriesCombinations))]
    public async Task GetMetric_EachMetricCode_ReturnsExpectedData(MetricCodeEnum metricCode, decimal lastValue)
    {
        var (httpCode, response) = await _client.POSTAsync<GetMetricEndpoint, GetMetricRequest, List<GetMetricResponse>>(
            new GetMetricRequest
            {
                MetricCode = metricCode,
                Locations = new() { new GetMetricRequest.Location { LocationCode = "E92000001", LocationType = Regional } }
            });

        httpCode.EnsureSuccessStatusCode();
        httpCode.StatusCode.ShouldBe(HttpStatusCode.OK);

        response.Count.ShouldBe(1);
        response[0].MetricCode.ShouldBe(metricCode.ToString());
        response[0].LocationCode.ShouldBe("E92000001");
        response[0].LocationType.ShouldBe("Regional");
        response[0].SeriesStartDate.ShouldBe(new DateTime(2001, 01, 01));
        response[0].SeriesFrequency.ShouldBe("Daily");
        response[0].Values.ShouldBe([lastValue]);
    }

    public static IEnumerable<object[]> MetricCodeTimeSeriesCombinations
    {
        get
        {
            yield return [bedcount, 6.6m];
            yield return [bedcount_per_hundred_thousand_adults, 6.7m];
            yield return [dementia_estimated_diagnosis_rate_65over, 6.8m];
            yield return [dementia_prevalence_65over, 6.9m];
            yield return [dementia_qof_prevalence, 6.11m];
            yield return [dementia_register_65over_per100k, 6.12m];
            yield return [learning_disability_prevalence, 6.13m];
            yield return [median_bed_count, 6.6m];
            yield return [median_occupancy, 6.15m];
            yield return [occupancy_rates, 6.16m];
            yield return [perc_18_64, 6.17m];
            yield return [perc_65over, 6.18m];
            yield return [perc_75over, 6.19m];
            yield return [perc_85over, 6.21m];
            yield return [perc_general_health, 6.22m];
            yield return [perc_household_ownership, 6.23m];
            yield return [perc_households_deprivation_deprived, 6.24m];
            yield return [perc_households_one_person, 6.25m];
            yield return [perc_population_disability, 6.26m];
            yield return [perc_unpaid_care_provider, 6.27m];
            yield return [total_population, 6.28m];

        }


    }

    [Fact]
    public async Task GetMetric_BedcountWithTimeSeries_ReturnsExpectedData()
    {
        var (httpCode, response) = await _client.POSTAsync<GetMetricEndpoint, GetMetricRequest, List<GetMetricResponse>>(
            new GetMetricRequest
            {
                MetricCode = bedcount,
                TimeSeries = true,
                Locations = new() { new GetMetricRequest.Location { LocationCode = "1-123456789", LocationType = National } }
            });

        httpCode.EnsureSuccessStatusCode();
        httpCode.StatusCode.ShouldBe(HttpStatusCode.OK);

        response.Count.ShouldBe(1);
        response[0].MetricCode.ShouldBe("bedcount");
        response[0].LocationCode.ShouldBe("1-123456789");
        response[0].LocationType.ShouldBe("National");
        response[0].SeriesStartDate.ShouldBe(new DateTime(2000, 01, 01));
        response[0].SeriesFrequency.ShouldBe("Daily");
        response[0].Values.ShouldBe([1.1m, 2.2m, 3.3m, 4.4m, 5.5m]);
    }

    [Theory]
    [MemberData(nameof(MetricCodeTimeSeriesCombinations))]
    public async Task GetMetric_AllMetricsWithTimeSeries_ReturnsExpectedData(MetricCodeEnum metricCode, decimal lastValue)
    {
        var (httpCode, response) = await _client.POSTAsync<GetMetricEndpoint, GetMetricRequest, List<GetMetricResponse>>(
            new GetMetricRequest
            {
                MetricCode = metricCode,
                TimeSeries = true,
                Locations = new() { new GetMetricRequest.Location { LocationCode = "E92000001", LocationType = Regional } }
            });

        httpCode.EnsureSuccessStatusCode();
        httpCode.StatusCode.ShouldBe(HttpStatusCode.OK);

        response.Count.ShouldBe(1);
        response[0].MetricCode.ShouldBe(metricCode.ToString());
        response[0].LocationCode.ShouldBe("E92000001");
        response[0].LocationType.ShouldBe(nameof(Regional));
        response[0].SeriesStartDate.ShouldBe(new DateTime(2001, 01, 01));
        response[0].SeriesFrequency.ShouldBe("Daily");
        response[0].Values.ShouldBe([2.2m, 3.3m, 4.4m, 5.5m, lastValue]);
    }

    [Fact]
    public async Task GetMetric_TwoLocations_Bedcount_ReturnsExpectedData()
    {
        var (httpCode, response) = await _client.POSTAsync<GetMetricEndpoint, GetMetricRequest, List<GetMetricResponse>>(
            new GetMetricRequest
            {
                MetricCode = bedcount,
                Locations = new List<GetMetricRequest.Location>
                {
                    new() { LocationCode = "1-123456789", LocationType = National },
                    new() { LocationCode = "E92000001", LocationType = Regional }
                }
            });

        httpCode.EnsureSuccessStatusCode();
        httpCode.StatusCode.ShouldBe(HttpStatusCode.OK);

        response.Count.ShouldBe(2);

        response[0].MetricCode.ShouldBe("bedcount");
        response[0].LocationCode.ShouldBe("1-123456789");
        response[0].LocationType.ShouldBe("National");
        response[0].SeriesStartDate.ShouldBe(new DateTime(2000, 01, 01));
        response[0].SeriesFrequency.ShouldBe("Daily");
        response[0].Values.ShouldBe([5.5m]);

        response[1].MetricCode.ShouldBe("bedcount");
        response[1].LocationCode.ShouldBe("E92000001");
        response[1].LocationType.ShouldBe("Regional");
        response[1].SeriesStartDate.ShouldBe(new DateTime(2001, 01, 01));
        response[1].SeriesFrequency.ShouldBe("Daily");
        response[1].Values.ShouldBe([6.6m]);
    }

    [Fact]
    public async Task GetMetric_TwoLocations_EveryMetric_ReturnsExpectedData()
    {
        var (httpCode, response) = await _client.POSTAsync<GetMetricEndpoint, GetMetricRequest, List<GetMetricResponse>>(
            new GetMetricRequest
            {
                MetricCode = bedcount,
                Locations = new List<GetMetricRequest.Location>
                {
                    new() { LocationCode = "1-123456789", LocationType = National },
                    new() { LocationCode = "E92000001", LocationType = Regional }
                },
                TimeSeries = true
            });

        httpCode.EnsureSuccessStatusCode();
        httpCode.StatusCode.ShouldBe(HttpStatusCode.OK);

        response.Count.ShouldBe(2);

        response[0].MetricCode.ShouldBe("bedcount");
        response[0].LocationCode.ShouldBe("1-123456789");
        response[0].LocationType.ShouldBe("National");
        response[0].SeriesStartDate.ShouldBe(new DateTime(2000, 01, 01));
        response[0].SeriesFrequency.ShouldBe("Daily");
        response[0].Values.ShouldBe([1.1m, 2.2m, 3.3m, 4.4m, 5.5m]);

        response[1].MetricCode.ShouldBe("bedcount");
        response[1].LocationCode.ShouldBe("E92000001");
        response[1].LocationType.ShouldBe("Regional");
        response[1].SeriesStartDate.ShouldBe(new DateTime(2001, 01, 01));
        response[1].SeriesFrequency.ShouldBe("Daily");
        response[1].Values.ShouldBe([2.2m, 3.3m, 4.4m, 5.5m, 6.6m]);
    }
}