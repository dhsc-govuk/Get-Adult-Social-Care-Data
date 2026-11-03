using api.Data.Shared;
using api.Endpoints.MetricLocation.LocalAuthorityPeerSeries;
using FastEndpoints;
using FastEndpoints.Testing;
using Shouldly;
using System.Net;
using System.Net.Http.Json;

namespace api.Tests.Endpoints.MetricLocations.LocalAuthorityPeerSeries;

[Collection("Sequential")]
public class GetLocalAuthorityPeerSeriesEndpointTests(App app) : TestBase<App>
{
    [Fact]
    public async Task GetPeerSeries_E08000014_OnePersonHouseholds_AveragesThePeers()
    {
        var (httpCode, response) =
            await app.Client.POSTAsync<GetLocalAuthorityPeerSeriesEndpoint, GetLocalAuthorityPeerSeriesRequest, List<GetLocalAuthorityPeerSeriesResponse>>(
                new GetLocalAuthorityPeerSeriesRequest
                {
                    LocalAuthorityCode = "E08000014",
                    MetricCodes = [MetricCodeEnum.perc_households_one_person]
                });

        httpCode.EnsureSuccessStatusCode();
        httpCode.StatusCode.ShouldBe(HttpStatusCode.OK);

        response.Count.ShouldBe(1);
        var series = response[0];
        series.MetricCode.ShouldBe(nameof(MetricCodeEnum.perc_households_one_person));
        // Peers E08000015-18 with latest values 19.3, 21.4, 17.8 and 22.2
        series.PeerCount.ShouldBe(4);
        series.SeriesStartDate.ShouldBe(new DateOnly(2021, 3, 1));
        series.SeriesEndDate.ShouldBe(new DateOnly(2021, 3, 21));
        series.SeriesFrequency.ShouldNotBeNullOrEmpty();
        series.Values.ShouldBe([20.175m]);
    }

    [Fact]
    public async Task GetPeerSeries_SeveralMetrics_ReturnsOneSeriesPerMetricWithData()
    {
        var (httpCode, response) =
            await app.Client.POSTAsync<GetLocalAuthorityPeerSeriesEndpoint, GetLocalAuthorityPeerSeriesRequest, List<GetLocalAuthorityPeerSeriesResponse>>(
                new GetLocalAuthorityPeerSeriesRequest
                {
                    LocalAuthorityCode = "E08000014",
                    MetricCodes =
                    [
                        MetricCodeEnum.perc_households_one_person,
                        MetricCodeEnum.perc_households_deprivation_deprived,
                        // No LA rows in the seed, so no series comes back for it
                        MetricCodeEnum.perc_population_disability
                    ]
                });

        httpCode.EnsureSuccessStatusCode();
        response.Select(x => x.MetricCode).ShouldBe(
        [
            nameof(MetricCodeEnum.perc_households_one_person),
            nameof(MetricCodeEnum.perc_households_deprivation_deprived)
        ]);
        // The deprivation seed rows carry a five point series, averaged point by point
        response[1].Values.Length.ShouldBe(5);
        response[1].Values[^1].ShouldBe(53.75m);
    }

    [Fact]
    public async Task GetPeerSeries_WithNonExistentLACode_ReturnsNotFound()
    {
        var response = await app.Client.PostAsJsonAsync(
            "/api/metric_locations/local_authority_peers/E00000000/series",
            new[] { nameof(MetricCodeEnum.perc_households_one_person) },
            TestContext.Current.CancellationToken);

        response.StatusCode.ShouldBe(HttpStatusCode.NotFound);
    }

    [Fact]
    public async Task GetPeerSeries_WithNoMetricCodes_ReturnsBadRequest()
    {
        var response = await app.Client.PostAsJsonAsync(
            "/api/metric_locations/local_authority_peers/E08000014/series",
            Array.Empty<string>(),
            TestContext.Current.CancellationToken);

        response.StatusCode.ShouldBe(HttpStatusCode.BadRequest);
    }
}
