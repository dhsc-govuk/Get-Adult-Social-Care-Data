using api.Endpoints.Metrics.Metadata;
using api.Tests.Fixtures;
using FastEndpoints;
using FastEndpoints.Testing;
using Newtonsoft.Json.Linq;
using Shouldly;
using System.Net;
using static api.Data.Shared.MetricCodeEnum;
using static api.Tests.Fixtures.TestUtils;

namespace api.Tests.Endpoints.Metrics.MetaData;

public class GetMetricMetadataTests(App app) : TestBase<App>
{
    [Fact]
    public async Task GetMetricMetadata_ReturnsOk()
    {
        var (httpCode, _) =
            await app.Client.GETAsync<GetMetricMetadataEndpoint, GetMetricMetadataRequest, GetMetricMetadataResponse>(
                new GetMetricMetadataRequest { MetricCode = nameof(bedcount_total) });
        httpCode.EnsureSuccessStatusCode();
        httpCode.StatusCode.ShouldBe(HttpStatusCode.OK);
    }

    [Fact]
    public async Task GetMetricMetadata_ReturnsExpectedMetricdata()
    {
        var (httpCode, response) =
            await app.Client.GETAsync<GetMetricMetadataEndpoint, GetMetricMetadataRequest, GetMetricMetadataResponse>(
                new GetMetricMetadataRequest { MetricCode = nameof(bedcount_total) });
        httpCode.EnsureSuccessStatusCode();
        httpCode.StatusCode.ShouldBe(HttpStatusCode.OK);
        response.MetricCode.ShouldBe(nameof(bedcount_total));
        response.MetricName.ShouldBe("metric group display name");
        response.FilterType.ShouldBe("Metric filter info");
        response.DataType.ShouldBe("numbers");
        response.DataSource.ShouldBe("ONS");
        response.Numerator.ShouldBe("This is a numerator");
        response.Denominator.ShouldBe("This is a denominator");
    }


    [Fact]
    public async Task GetMetricMetadata_ReturnsExpectedJsonObject()
    {
        var response = await app.Client.GetAsync($"api/metrics/{bedcount_total}/metadata", TestContext.Current.CancellationToken);
        response.StatusCode.ShouldBe(HttpStatusCode.OK);
        var jObject = await ParseJsonResponse<JObject>(response);
        GetFromJson(jObject, "metric_code").ShouldBe(nameof(bedcount_total));
        GetFromJson(jObject, "metric_name").ShouldBe("metric group display name");
        GetFromJson(jObject, "filter_type").ShouldBe("Metric filter info");
        GetFromJson(jObject, "data_type").ShouldBe("numbers");
        GetFromJson(jObject, "data_source").ShouldBe("ONS");
        GetFromJson(jObject, "numerator").ShouldBe("This is a numerator");
        GetFromJson(jObject, "denominator").ShouldBe("This is a denominator");
    }

    [Fact]
    public async Task NonExistent_MetricCode_Input()
    {
        var (httpResponse, _) =
            await app.Client.GETAsync<GetMetricMetadataEndpoint, GetMetricMetadataRequest, ProblemDetails>(
                new GetMetricMetadataRequest { MetricCode = "non_existant_code" });
        httpResponse.StatusCode.ShouldBe(HttpStatusCode.NotFound);
    }

    [Theory]
    [InlineData("a", "Metric code has a minimum length of 3")]
    [InlineData("this-is-a-very-long-metric-code-without-any-possible-chance-of-being-valid-as-it-is-just-far-too-long", "Metric code has a maximum length of 100")]
    public async Task Invalid_MetricCode_Input(string metricCode, string expectedErrorMessage)
    {
        var (httpResponse, problemDetails) =
            await app.Client.GETAsync<GetMetricMetadataEndpoint, GetMetricMetadataRequest, ProblemDetails>(
                new GetMetricMetadataRequest { MetricCode = metricCode });
        httpResponse.StatusCode.ShouldBe(HttpStatusCode.BadRequest);
        problemDetails.Errors.Count().ShouldBe(1);
        problemDetails.Errors.Select(e => e.Name).ShouldBe(["metric_code"]);
        problemDetails.Errors.Select(e => e.Reason).ShouldBe([expectedErrorMessage]);
    }
}