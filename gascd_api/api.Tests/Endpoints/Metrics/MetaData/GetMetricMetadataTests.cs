using api.Endpoints.Metrics.Metadata;
using api.Tests.Fixtures;
using FastEndpoints;
using Newtonsoft.Json.Linq;
using Shouldly;
using System.Net;
using static api.Tests.Fixtures.TestUtils;

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


    [Fact]
    public async Task GetMetricMetadata_ReturnsExpectedJsonObject()
    {
        var response = await _client.GetAsync("api/metrics/metric_code/metadata", TestContext.Current.CancellationToken);
        response.StatusCode.ShouldBe(HttpStatusCode.OK);
        var jObject = await ParseJsonResponse<JObject>(response);
        GetFromJson(jObject, "metric_code").ShouldBe("metric_code");
        GetFromJson(jObject, "metric_name").ShouldBe("Metric");
        GetFromJson(jObject, "data_type").ShouldBe("numbers");
        GetFromJson(jObject, "data_source").ShouldBe("ONS");
        GetFromJson(jObject, "numerator").ShouldBe("This is a numerator");
        GetFromJson(jObject, "denominator").ShouldBe("This is a denominator");
    }

    [Fact]
    public async Task NonExistent_MetricCode_Input()
    {
        var (httpResponse, problemDetails) =
            await _client.GETAsync<GetMetricMetadataEndpoint, GetMetricMetadataRequest, ProblemDetails>(
                new GetMetricMetadataRequest { MetricCode = "non_existant_code" });
        httpResponse.StatusCode.ShouldBe(HttpStatusCode.NotFound);
    }

    [Theory]
    [InlineData("a", "Metric code has a minimum length of 3")]
    [InlineData("a-very-long-name-over-one-hundred-characters-long-a-very-long-name-over-one-hundred-characters-long-a-very-long-name-over-one-hundred-characters-long-a-very-long-name-over-one-hundred-characters-long", "Metric code has a maximum length of 100")]
    public async Task Invalid_MetricCode_Input(string metricCode, string expectedErrorMessage)
    {
        var (httpResponse, problemDetails) =
            await _client.GETAsync<GetMetricMetadataEndpoint, GetMetricMetadataRequest, ProblemDetails>(
                new GetMetricMetadataRequest { MetricCode = metricCode });
        httpResponse.StatusCode.ShouldBe(HttpStatusCode.BadRequest);
        problemDetails.Errors.Count().ShouldBe(1);
        problemDetails.Errors.Select(e => e.Name).ShouldBe(["metric_code"]);
        problemDetails.Errors.Select(e => e.Reason).ShouldBe([expectedErrorMessage]);
    }


}