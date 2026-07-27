using api.Data.Shared;
using api.Endpoints.MetricLocation.LocalAuthorityPeers;
using FastEndpoints;
using FastEndpoints.Testing;
using Shouldly;
using System.Net;

namespace api.Tests.Endpoints.MetricLocations.LocalAuthorityPeers;

[Collection("Sequential")]
public class GetLocalAuthorityPeersEndpointTests(App app) : TestBase<App>
{
    [Fact]
    public async Task GetLocalAuthorityPeers_WithValidLACode_ReturnsOk()
    {
        var (httpCode, _) =
            await app.Client.GETAsync<GetLocalAuthorityPeersEndpoint, GetLocalAuthorityPeersRequest, GetLocalAuthorityPeersResponse>(
                new GetLocalAuthorityPeersRequest
                {
                    LocalAuthorityCode = "E08000014",
                    MetricCode = MetricCodeEnum.perc_households_deprivation_deprived
                });

        httpCode.EnsureSuccessStatusCode();
        httpCode.StatusCode.ShouldBe(HttpStatusCode.OK);
    }

    [Fact]
    public async Task GetLocalAuthorityPeers_E08000014_DeprivationMetric_ReturnsExpectedPeersWithKnownValues()
    {
        var (httpCode, response) =
            await app.Client.GETAsync<GetLocalAuthorityPeersEndpoint, GetLocalAuthorityPeersRequest, GetLocalAuthorityPeersResponse>(
                new GetLocalAuthorityPeersRequest
                {
                    LocalAuthorityCode = "E08000014",
                    MetricCode = MetricCodeEnum.perc_households_deprivation_deprived
                });

        httpCode.EnsureSuccessStatusCode();

        response.LocalAuthorityPeers.Count.ShouldBe(4);

        response.LocalAuthorityPeers[0].Code.ShouldBe("E08000018");
        response.LocalAuthorityPeers[0].DisplayName.ShouldBe("Sheffield");
        response.LocalAuthorityPeers[0].MetricValue.ShouldBe(55.5m);

        response.LocalAuthorityPeers[1].Code.ShouldBe("E08000017");
        response.LocalAuthorityPeers[1].DisplayName.ShouldBe("Leeds");
        response.LocalAuthorityPeers[1].MetricValue.ShouldBe(54.5m);

        response.LocalAuthorityPeers[2].Code.ShouldBe("E08000016");
        response.LocalAuthorityPeers[2].DisplayName.ShouldBe("Cheshire");
        response.LocalAuthorityPeers[2].MetricValue.ShouldBe(53.5m);

        response.LocalAuthorityPeers[3].Code.ShouldBe("E08000015");
        response.LocalAuthorityPeers[3].DisplayName.ShouldBe("Manchester");
        response.LocalAuthorityPeers[3].MetricValue.ShouldBe(51.5m);

        response.AveragePeerGroup.ShouldBe(53.75m);
        response.NationalAverage.ShouldBe(10.5m);
    }

    [Fact]
    public async Task GetLocalAuthorityPeers_E08000014_OnePersonHouseholdsMetric_ReturnsExpectedValues()
    {
        var (httpCode, response) =
            await app.Client.GETAsync<GetLocalAuthorityPeersEndpoint, GetLocalAuthorityPeersRequest, GetLocalAuthorityPeersResponse>(
                new GetLocalAuthorityPeersRequest
                {
                    LocalAuthorityCode = "E08000014",
                    MetricCode = MetricCodeEnum.perc_households_one_person
                });

        httpCode.EnsureSuccessStatusCode();

        response.LocalAuthorityPeers.Count.ShouldBe(4);

        response.LocalAuthorityPeers[0].Code.ShouldBe("E08000018");
        response.LocalAuthorityPeers[0].MetricValue.ShouldBe(22.2m);

        response.LocalAuthorityPeers[1].Code.ShouldBe("E08000016");
        response.LocalAuthorityPeers[1].MetricValue.ShouldBe(21.4m);

        response.LocalAuthorityPeers[2].Code.ShouldBe("E08000015");
        response.LocalAuthorityPeers[2].MetricValue.ShouldBe(19.3m);

        response.LocalAuthorityPeers[3].Code.ShouldBe("E08000017");
        response.LocalAuthorityPeers[3].MetricValue.ShouldBe(17.8m);

        response.AveragePeerGroup.ShouldBe(20.175m);
        response.NationalAverage.ShouldBe(18.5m);
    }

    [Fact]
    public async Task GetLocalAuthorityPeers_WithInvalidLACode_ReturnsNotFound()
    {
        var response = await app.Client.GetAsync(
            $"/api/metric_locations/local_authority_peers/INVALID?metric_code={MetricCodeEnum.perc_households_deprivation_deprived}",
            TestContext.Current.CancellationToken);

        response.StatusCode.ShouldBe(HttpStatusCode.NotFound);
    }

    [Fact]
    public async Task GetLocalAuthorityPeers_WithNonExistentLACode_ReturnsNotFound()
    {
        var response = await app.Client.GetAsync(
            $"/api/metric_locations/local_authority_peers/E00000000?metric_code={MetricCodeEnum.perc_households_deprivation_deprived}",
            TestContext.Current.CancellationToken);

        response.StatusCode.ShouldBe(HttpStatusCode.NotFound);
    }

    [Theory]
    [InlineData("E08000014")]
    [InlineData("E08000015")]
    [InlineData("E08000016")]
    [InlineData("E08000017")]
    [InlineData("E08000018")]
    public async Task GetLocalAuthorityPeers_WithDifferentLACodes_ReturnsOk(string laCode)
    {
        var (httpCode, response) =
            await app.Client.GETAsync<GetLocalAuthorityPeersEndpoint, GetLocalAuthorityPeersRequest, GetLocalAuthorityPeersResponse>(
                new GetLocalAuthorityPeersRequest
                {
                    LocalAuthorityCode = laCode,
                    MetricCode = MetricCodeEnum.perc_households_deprivation_deprived
                });

        httpCode.StatusCode.ShouldBe(HttpStatusCode.OK);
        response.ShouldNotBeNull();
        response.LocalAuthorityPeers.ShouldNotBeEmpty();
    }

    [Fact]
    public async Task GetLocalAuthorityPeers_AllPeersHaveValidData()
    {
        var (httpCode, response) =
            await app.Client.GETAsync<GetLocalAuthorityPeersEndpoint, GetLocalAuthorityPeersRequest, GetLocalAuthorityPeersResponse>(
                new GetLocalAuthorityPeersRequest
                {
                    LocalAuthorityCode = "E08000014",
                    MetricCode = MetricCodeEnum.perc_households_deprivation_deprived
                });

        httpCode.EnsureSuccessStatusCode();

        foreach (var peer in response.LocalAuthorityPeers)
        {
            peer.Code.ShouldNotBeNullOrWhiteSpace();
            peer.DisplayName.ShouldNotBeNullOrWhiteSpace();
            peer.PeerRanking.ShouldBeGreaterThan(0);
            peer.MetricValue.ShouldNotBeNull();
        }
    }
}
