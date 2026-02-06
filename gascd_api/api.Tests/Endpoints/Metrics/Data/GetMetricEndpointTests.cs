using api.Data.Shared;
using api.Endpoints.Metrics.Data;
using FastEndpoints;
using FastEndpoints.Testing;
using Newtonsoft.Json.Linq;
using Shouldly;
using System.Net;
using System.Text;
using static api.Data.Shared.LocationTypeEnum;
using static api.Data.Shared.MetricCodeEnum;
using static api.Tests.Fixtures.TestUtils;

namespace api.Tests.Endpoints.Metrics.Data;

[Collection("Sequential")]
public class GetMetricEndpointTests(App app) : TestBase<App>
{
    [Fact]
    public async Task GetMetric_ReturnsOk()
    {
        var (httpCode, _) =
            await app.Client.POSTAsync<GetMetricEndpoint, GetMetricRequest, List<GetMetricResponse>>(
                new GetMetricRequest
                {
                    MetricCode = bedcount_total,
                    Locations = [new() { LocationCode = "1-123456789", LocationType = National }]
                });
        httpCode.EnsureSuccessStatusCode();
        httpCode.StatusCode.ShouldBe(HttpStatusCode.OK);
    }

    [Fact]
    public async Task GetMetric_Bedcount_ReturnsExpectedData()
    {
        var (httpCode, response) =
            await app.Client.POSTAsync<GetMetricEndpoint, GetMetricRequest, List<GetMetricResponse>>(
                new GetMetricRequest
                {
                    MetricCode = bedcount_total,
                    Locations = [new() { LocationCode = "1-123456789", LocationType = National }]
                });
        httpCode.EnsureSuccessStatusCode();
        httpCode.StatusCode.ShouldBe(HttpStatusCode.OK);

        response.Count.ShouldBe(1);
        response[0].MetricCode.ShouldBe(nameof(bedcount_total));
        response[0].LocationCode.ShouldBe("1-123456789");
        response[0].LocationType.ShouldBe(nameof(National));
        response[0].SeriesStartDate.ShouldBe(null);
        response[0].SeriesEndDate.ShouldBe(new DateOnly(2025, 01, 01));
        response[0].SeriesFrequency.ShouldBe("Daily");
        response[0].Values.ShouldBe([5.5m]);
    }

    [Fact]
    public async Task GetMetric_Bedcount_AnotherLocationReturnsExpectedData()
    {
        var (httpCode, response) =
            await app.Client.POSTAsync<GetMetricEndpoint, GetMetricRequest, List<GetMetricResponse>>(
                new GetMetricRequest
                {
                    MetricCode = bedcount_total,
                    Locations = [new GetMetricRequest.Location { LocationCode = "E92000001", LocationType = Regional }]
                });
        httpCode.EnsureSuccessStatusCode();
        httpCode.StatusCode.ShouldBe(HttpStatusCode.OK);

        response.Count.ShouldBe(1);
        response[0].MetricCode.ShouldBe(nameof(bedcount_total));
        response[0].LocationCode.ShouldBe("E92000001");
        response[0].LocationType.ShouldBe(nameof(Regional));
        response[0].SeriesStartDate.ShouldBe(null);
        response[0].SeriesEndDate.ShouldBe(new DateOnly(2026, 01, 01));
        response[0].SeriesFrequency.ShouldBe("Daily");
        response[0].Values.ShouldBe([6.6m]);
    }


    [Theory]
    [MemberData(nameof(MetricCodeTimeSeriesCombinations))]
    public async Task GetMetric_NonExistentLocationCode_Returns404(MetricCodeEnum metricCode, decimal _)
    {
        var (httpCode, _) =
            await app.Client.POSTAsync<GetMetricEndpoint, GetMetricRequest, List<GetMetricResponse>>(
                new GetMetricRequest
                {
                    MetricCode = metricCode,
                    Locations = [new() { LocationCode = "nonexistent", LocationType = National }]
                });
        httpCode.StatusCode.ShouldBe(HttpStatusCode.NotFound);
    }

    [Fact]
    public async Task GetMetric_MultipleNonExistentLocationCodes_Returns404()
    {
        var (httpCode, _) =
            await app.Client.POSTAsync<GetMetricEndpoint, GetMetricRequest, List<GetMetricResponse>>(
                new GetMetricRequest
                {
                    MetricCode = bedcount_per_hundred_thousand_adults_total,
                    Locations =
                    [
                        new() { LocationCode = "nonexistent", LocationType = National },
                        new() { LocationCode = "nonexistent2", LocationType = Regional },
                        new() { LocationCode = "nonexistent3", LocationType = LA }
                    ]
                });
        httpCode.StatusCode.ShouldBe(HttpStatusCode.NotFound);
    }


    [Theory]
    [MemberData(nameof(MetricCodeTimeSeriesCombinations))]
    public async Task GetMetric_NonExistentLocationType_Returns404(MetricCodeEnum metricCode, decimal _)
    {
        HttpContent content = new StringContent("[ { \"location_code\": \"E92000001\", \"location_type\": \"nonexistent\" } ]",
            Encoding.UTF8, "application/json");
        var response = await app.Client.PostAsync($"api/metrics/{metricCode}/data", content, TestContext.Current.CancellationToken);
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
            await app.Client.POSTAsync<GetMetricEndpoint, GetMetricRequest, ProblemDetails>(
                new GetMetricRequest
                {
                    MetricCode = metricCode,
                    Locations = [new() { LocationCode = locationCode, LocationType = Regional }]
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
            foreach (var obj in MetricCodeTimeSeriesCombinations)
            {
                yield return [obj[0], " ", "Location code is required"];
                yield return [obj[0], "1-", "Location code has a minimum length of 3"];
                yield return [obj[0], "1-12345678910112", "Location code has a maximum length of 15"];
            }
        }
    }

    [Fact]
    public async Task GetMetric_NonExistent_MetricCodeInput()
    {
        HttpContent content = new StringContent("[ { \"location_code\": \"E92000001\", \"location_type\": 0 } ]",
            Encoding.UTF8, "application/json");
        var response = await app.Client.PostAsync("api/metrics/nonexistent/data", content, TestContext.Current.CancellationToken);
        response.StatusCode.ShouldBe(HttpStatusCode.BadRequest);

        JObject? json = await ParseJsonResponse<JObject>(response);
        GetFromJson(json, "errors[0].name").ShouldBe("metric_code");
        GetFromJson(json, "errors[0].reason").ShouldBe("Value [nonexistent] is not valid for a [MetricCodeEnum] property!");
    }


    [Theory]
    [MemberData(nameof(MetricCodeTimeSeriesCombinations))]
    public async Task GetMetric_EachMetricCode_ReturnsExpectedData(MetricCodeEnum metricCode, decimal lastValue)
    {
        var (httpCode, response) =
            await app.Client.POSTAsync<GetMetricEndpoint, GetMetricRequest, List<GetMetricResponse>>(
                new GetMetricRequest
                {
                    MetricCode = metricCode,
                    Locations = [new() { LocationCode = "E92000001", LocationType = Regional }]
                });
        httpCode.EnsureSuccessStatusCode();
        httpCode.StatusCode.ShouldBe(HttpStatusCode.OK);

        response.Count.ShouldBe(1);
        response[0].MetricCode.ShouldBe(metricCode.ToString());
        response[0].LocationCode.ShouldBe("E92000001");
        response[0].LocationType.ShouldBe(nameof(Regional));
        response[0].SeriesStartDate.ShouldBe(null);
        response[0].SeriesEndDate.ShouldBe(new DateOnly(2026, 01, 01));
        response[0].SeriesFrequency.ShouldBe("Daily");
        response[0].Values.ShouldBe([lastValue]);
    }

    [Fact]
    public async Task GetMetric_BedcountWithTimeSeries_ReturnsExpectedData()
    {
        var (httpCode, response) =
            await app.Client.POSTAsync<GetMetricEndpoint, GetMetricRequest, List<GetMetricResponse>>(
                new GetMetricRequest
                {
                    MetricCode = bedcount_total,
                    TimeSeries = true,
                    Locations = [new() { LocationCode = "1-123456789", LocationType = National }]
                });
        httpCode.EnsureSuccessStatusCode();
        httpCode.StatusCode.ShouldBe(HttpStatusCode.OK);

        response.Count.ShouldBe(1);
        response[0].MetricCode.ShouldBe(nameof(bedcount_total));
        response[0].LocationCode.ShouldBe("1-123456789");
        response[0].LocationType.ShouldBe(nameof(National));
        response[0].SeriesStartDate.ShouldBe(new DateOnly(2000, 01, 01));
        response[0].SeriesEndDate.ShouldBe(new DateOnly(2025, 01, 01));
        response[0].SeriesFrequency.ShouldBe("Daily");
        response[0].Values.ShouldBe([1.1m, 2.2m, 3.3m, 4.4m, 5.5m]);
    }

    [Theory]
    [MemberData(nameof(MetricCodeTimeSeriesCombinations))]
    public async Task GetMetric_AllMetricsWithTimeSeries_ReturnsExpectedData(MetricCodeEnum metricCode, decimal lastValue)
    {
        var (httpCode, response) =
            await app.Client.POSTAsync<GetMetricEndpoint, GetMetricRequest, List<GetMetricResponse>>(
                new GetMetricRequest
                {
                    MetricCode = metricCode,
                    TimeSeries = true,
                    Locations = [new() { LocationCode = "E92000001", LocationType = Regional }]
                });
        httpCode.EnsureSuccessStatusCode();
        httpCode.StatusCode.ShouldBe(HttpStatusCode.OK);

        response.Count.ShouldBe(1);
        response[0].MetricCode.ShouldBe(metricCode.ToString());
        response[0].LocationCode.ShouldBe("E92000001");
        response[0].LocationType.ShouldBe(nameof(Regional));
        response[0].SeriesStartDate.ShouldBe(new DateOnly(2001, 01, 01));
        response[0].SeriesEndDate.ShouldBe(new DateOnly(2026, 01, 01));
        response[0].SeriesFrequency.ShouldBe("Daily");
        response[0].Values.ShouldBe([2.2m, 3.3m, 4.4m, 5.5m, lastValue]);
    }

    [Fact]
    public async Task GetMetric_TwoLocations_Bedcount_ReturnsExpectedData()
    {
        var (httpCode, response) =
            await app.Client.POSTAsync<GetMetricEndpoint, GetMetricRequest, List<GetMetricResponse>>(
                new GetMetricRequest
                {
                    MetricCode = bedcount_total,
                    Locations =
                    [
                        new() { LocationCode = "1-123456789", LocationType = National },
                        new() { LocationCode = "E92000001", LocationType = Regional }
                    ]
                });
        httpCode.EnsureSuccessStatusCode();
        httpCode.StatusCode.ShouldBe(HttpStatusCode.OK);

        response.Count.ShouldBe(2);
        response[0].MetricCode.ShouldBe(nameof(bedcount_total));
        response[0].LocationCode.ShouldBe("1-123456789");
        response[0].LocationType.ShouldBe(nameof(National));
        response[0].SeriesStartDate.ShouldBe(null);
        response[0].SeriesEndDate.ShouldBe(new DateOnly(2025, 01, 01));
        response[0].SeriesFrequency.ShouldBe("Daily");
        response[0].Values.ShouldBe([5.5m]);

        response[1].MetricCode.ShouldBe(nameof(bedcount_total));
        response[1].LocationCode.ShouldBe("E92000001");
        response[1].LocationType.ShouldBe(nameof(Regional));
        response[1].SeriesStartDate.ShouldBe(null);
        response[1].SeriesEndDate.ShouldBe(new DateOnly(2026, 01, 01));
        response[1].SeriesFrequency.ShouldBe("Daily");
        response[1].Values.ShouldBe([6.6m]);
    }

    [Fact]
    public async Task GetMetric_TwoLocations_TimeSeriesTrue_ReturnsExpectedData()
    {
        var (httpCode, response) =
            await app.Client.POSTAsync<GetMetricEndpoint, GetMetricRequest, List<GetMetricResponse>>(
                new GetMetricRequest
                {
                    MetricCode = bedcount_total,
                    Locations =
                    [
                        new() { LocationCode = "1-123456789", LocationType = National },
                        new() { LocationCode = "E92000001", LocationType = Regional }
                    ],
                    TimeSeries = true
                });
        httpCode.EnsureSuccessStatusCode();
        httpCode.StatusCode.ShouldBe(HttpStatusCode.OK);

        response.Count.ShouldBe(2);
        response[0].MetricCode.ShouldBe(nameof(bedcount_total));
        response[0].LocationCode.ShouldBe("1-123456789");
        response[0].LocationType.ShouldBe(nameof(National));
        response[0].SeriesStartDate.ShouldBe(new DateOnly(2000, 01, 01));
        response[0].SeriesEndDate.ShouldBe(new DateOnly(2025, 01, 01));
        response[0].SeriesFrequency.ShouldBe("Daily");
        response[0].Values.ShouldBe([1.1m, 2.2m, 3.3m, 4.4m, 5.5m]);

        response[1].MetricCode.ShouldBe(nameof(bedcount_total));
        response[1].LocationCode.ShouldBe("E92000001");
        response[1].LocationType.ShouldBe(nameof(Regional));
        response[1].SeriesStartDate.ShouldBe(new DateOnly(2001, 01, 01));
        response[1].SeriesEndDate.ShouldBe(new DateOnly(2026, 01, 01));
        response[1].SeriesFrequency.ShouldBe("Daily");
        response[1].Values.ShouldBe([2.2m, 3.3m, 4.4m, 5.5m, 6.6m]);
    }

    [Fact]
    public async Task GetMetric_MultipleLocations_OneDoesntExist_TimeSeriesTrue_ReturnsExpectedData()
    {
        var (httpCode, response) =
            await app.Client.POSTAsync<GetMetricEndpoint, GetMetricRequest, List<GetMetricResponse>>(
                new GetMetricRequest
                {
                    MetricCode = bedcount_total,
                    Locations =
                    [
                        new() { LocationCode = "1-123456789", LocationType = National },
                        new() { LocationCode = "non-existent", LocationType = Regional }
                    ],
                    TimeSeries = true
                });

        httpCode.EnsureSuccessStatusCode();
        httpCode.StatusCode.ShouldBe(HttpStatusCode.OK);

        response.Count.ShouldBe(1);
        response[0].MetricCode.ShouldBe(nameof(bedcount_total));
        response[0].LocationCode.ShouldBe("1-123456789");
        response[0].LocationType.ShouldBe(nameof(National));
        response[0].SeriesStartDate.ShouldBe(new DateOnly(2000, 01, 01));
        response[0].SeriesEndDate.ShouldBe(new DateOnly(2025, 01, 01));
        response[0].SeriesFrequency.ShouldBe("Daily");
        response[0].Values.ShouldBe([1.1m, 2.2m, 3.3m, 4.4m, 5.5m]);
    }

    [Fact]
    public async Task GetMetric_TwoLocations_TimeSeriesTrue_ReturnsExpectedJsonData()
    {

        HttpContent content = new StringContent($"[ {{ \"location_code\": \"1-123456789\", \"location_type\": \"{National}\" }} " +
                                                $",{{ \"location_code\": \"E92000001\", \"location_type\": \"{Regional}\" }} ]",
            Encoding.UTF8, "application/json");
        var response = await app.Client.PostAsync($"api/metrics/{bedcount_total}/data?time_series=true", content, TestContext.Current.CancellationToken);

        response.StatusCode.ShouldBe(HttpStatusCode.OK);
        var jArray = await ParseJsonResponse<JArray>(response);

        GetFromJson(jArray, "[0].metric_code").ShouldBe(nameof(bedcount_total));
        GetFromJson(jArray, "[0].location_code").ShouldBe("1-123456789");
        GetFromJson(jArray, "[0].location_type").ShouldBe(nameof(National));
        GetFromJson(jArray, "[0].series_start_date").ShouldBe("2000-01-01");
        GetFromJson(jArray, "[0].series_end_date").ShouldBe("2025-01-01");
        GetFromJson(jArray, "[0].series_frequency").ShouldBe("Daily");
        GetFromJson(jArray, "[0].values[0]").ShouldBe("1.1");
        GetFromJson(jArray, "[0].values[1]").ShouldBe("2.2");
        GetFromJson(jArray, "[0].values[2]").ShouldBe("3.3");
        GetFromJson(jArray, "[0].values[3]").ShouldBe("4.4");
        GetFromJson(jArray, "[0].values[4]").ShouldBe("5.5");

        GetFromJson(jArray, "[1].metric_code").ShouldBe(nameof(bedcount_total));
        GetFromJson(jArray, "[1].location_code").ShouldBe("E92000001");
        GetFromJson(jArray, "[1].location_type").ShouldBe(nameof(Regional));
        GetFromJson(jArray, "[1].series_start_date").ShouldBe("2001-01-01");
        GetFromJson(jArray, "[1].series_end_date").ShouldBe("2026-01-01");
        GetFromJson(jArray, "[1].series_frequency").ShouldBe("Daily");
        GetFromJson(jArray, "[1].values[0]").ShouldBe("2.2");
        GetFromJson(jArray, "[1].values[1]").ShouldBe("3.3");
        GetFromJson(jArray, "[1].values[2]").ShouldBe("4.4");
        GetFromJson(jArray, "[1].values[3]").ShouldBe("5.5");
        GetFromJson(jArray, "[1].values[4]").ShouldBe("6.6");
    }

    [Fact]
    public async Task GetMetric_WithNullTimeSeriesValues_ReturnsExpectedData()
    {
        var (httpCode, response) =
            await app.Client.POSTAsync<GetMetricEndpoint, GetMetricRequest, List<GetMetricResponse>>(
                new GetMetricRequest
                {
                    MetricCode = bedcount_per_hundred_thousand_adults_total,
                    TimeSeries = true,
                    Locations = [new() { LocationCode = "1-123456789", LocationType = National }]
                });
        httpCode.EnsureSuccessStatusCode();
        httpCode.StatusCode.ShouldBe(HttpStatusCode.OK);

        response.Count.ShouldBe(1);
        response[0].MetricCode.ShouldBe(nameof(bedcount_per_hundred_thousand_adults_total));
        response[0].LocationCode.ShouldBe("1-123456789");
        response[0].LocationType.ShouldBe(nameof(National));
        response[0].SeriesStartDate.ShouldBe(new DateOnly(2002, 01, 01));
        response[0].SeriesEndDate.ShouldBe(new DateOnly(2024, 01, 01));
        response[0].SeriesFrequency.ShouldBe("Daily");
        response[0].Values.ShouldBe([22.2m, null, 44.4m, null, 32.1m]);
    }

    [Theory]
    [MemberData(nameof(LocationTypeCombinations))]
    public async Task GetMetric_MetricsWithDifferentLocationCodes_ReturnsExpectedData(LocationTypeEnum locationType, decimal lastValue)
    {
        var (httpCode, response) =
            await app.Client.POSTAsync<GetMetricEndpoint, GetMetricRequest, List<GetMetricResponse>>(
                new GetMetricRequest
                {
                    MetricCode = bedcount_total,
                    TimeSeries = true,
                    Locations = [new() { LocationCode = "E92000001", LocationType = locationType }]
                });
        httpCode.EnsureSuccessStatusCode();
        httpCode.StatusCode.ShouldBe(HttpStatusCode.OK);

        response.Count.ShouldBe(1);
        response[0].MetricCode.ShouldBe(nameof(bedcount_total));
        response[0].LocationCode.ShouldBe("E92000001");
        response[0].LocationType.ShouldBe(locationType.ToString());
        response[0].SeriesStartDate.ShouldBe(new DateOnly(2001, 01, 01));
        response[0].SeriesEndDate.ShouldBe(new DateOnly(2026, 01, 01));
        response[0].SeriesFrequency.ShouldBe("Daily");
        response[0].Values.ShouldBe([2.2m, 3.3m, 4.4m, 5.5m, lastValue]);
    }

    public static IEnumerable<object[]> LocationTypeCombinations
    {
        get
        {
            yield return [Regional, 6.6m];
            yield return [LA, 7.7m];
            yield return [CareProviderLocation, 8.8m];
            yield return [National, 9.9m];
        }
    }

    public static IEnumerable<object[]> MetricCodeTimeSeriesCombinations
    {
        get
        {
            yield return [bedcount_total, 6.6m];
            yield return [bedcount_per_hundred_thousand_adults_total, 6.7m];
            yield return [bedcount_per_hundred_thousand_adults_dementia_nursing, 7.1m];
            yield return [bedcount_per_hundred_thousand_adults_dementia_residential, 7.2m];
            yield return [bedcount_per_hundred_thousand_adults_general_nursing, 7.3m];
            yield return [bedcount_per_hundred_thousand_adults_general_residential, 7.4m];
            yield return [bedcount_per_hundred_thousand_adults_learning_disability_nursing, 7.5m];
            yield return [bedcount_per_hundred_thousand_adults_learning_disability_residential, 7.6m];
            yield return [bedcount_per_hundred_thousand_adults_mental_health_nursing, 7.7m];
            yield return [bedcount_per_hundred_thousand_adults_mental_health_residential, 7.8m];
            yield return [bedcount_per_hundred_thousand_adults_transitional, 7.9m];
            yield return [bedcount_per_hundred_thousand_adults_ypd_young_physically_disabled, 7.11m];
            yield return [dementia_estimated_diagnosis_rate_65over, 6.8m];
            yield return [dementia_prevalence_65over, 6.9m];
            yield return [dementia_qof_prevalence, 6.11m];
            yield return [dementia_register_65over_per100k, 6.12m];
            yield return [learning_disability_prevalence, 6.13m];
            yield return [median_bed_count_total, 6.6m];
            yield return [median_occupancy_total, 6.15m];
            yield return [occupancy_rate_total, 6.16m];
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
}