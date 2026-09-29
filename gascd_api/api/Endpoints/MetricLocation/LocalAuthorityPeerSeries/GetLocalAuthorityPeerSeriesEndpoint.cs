using api.Data;
using api.Data.Shared;
using api.Services;
using FastEndpoints;
using Microsoft.EntityFrameworkCore;

namespace api.Endpoints.MetricLocation.LocalAuthorityPeerSeries;

/// <summary>
/// Averages each requested metric's time series across a local authority's statistical
/// peers, so the front end can draw a peer group average alongside the authority's own
/// series. The peers endpoint covers the latest value only; this covers the whole series.
/// </summary>
public class GetLocalAuthorityPeerSeriesEndpoint(
    GascdDataContext context,
    ILogger<GetLocalAuthorityPeerSeriesEndpoint> logger)
    : Endpoint<GetLocalAuthorityPeerSeriesRequest, List<GetLocalAuthorityPeerSeriesResponse>>
{
    public override void Configure()
    {
        Post("/api/metric_locations/local_authority_peers/{LocalAuthorityCode}/series");
    }

    public override async Task HandleAsync(GetLocalAuthorityPeerSeriesRequest req, CancellationToken ct)
    {
        logger.LogDebug("Received request for peer average series for LA code: {code}", req.LocalAuthorityCode);

        var sourceLocalAuthorityId = await context.LocalAuthorities
            .AsNoTracking()
            .Where(x => x.Code == req.LocalAuthorityCode)
            .Select(x => (int?)x.Id)
            .SingleOrDefaultAsync(ct);

        if (sourceLocalAuthorityId is null)
        {
            logger.LogInformation("Local Authority code not found: {code}", req.LocalAuthorityCode);
            await Send.NotFoundAsync(ct);
            return;
        }

        var peerCodes = await context.LocalAuthorityPeers
            .AsNoTracking()
            .Where(x => x.LocalAuthorityFk == sourceLocalAuthorityId)
            .Select(x => x.PeerLocalAuthority.Code)
            .Distinct()
            .ToListAsync(ct);

        var laLocationType = LocationTypeEnum.LA.ToString();
        var response = new List<GetLocalAuthorityPeerSeriesResponse>();

        foreach (var metricCode in req.MetricCodes.Distinct())
        {
            var metricCodeString = metricCode.ToString();

            var peerSeries = await context.GetMetricTimeSeriesQueryable(metricCode)
                .AsNoTracking()
                .Include(x => x.Metric)
                .Where(x => x.Metric.Code == metricCodeString)
                .Where(x => x.LocationType == laLocationType && peerCodes.Contains(x.LocationCode))
                .ToListAsync(ct);

            var averaged = PeerSeriesAverager.Average(peerSeries);
            if (averaged is not null)
            {
                response.Add(new GetLocalAuthorityPeerSeriesResponse
                {
                    MetricCode = metricCodeString,
                    PeerCount = averaged.PeerCount,
                    SeriesStartDate = averaged.StartDate,
                    SeriesEndDate = averaged.EndDate,
                    SeriesFrequency = averaged.Frequency,
                    Values = averaged.Values,
                });
            }
        }

        logger.LogInformation("Finished processing peer average series for LA code: {code}", req.LocalAuthorityCode);
        await Send.OkAsync(response, ct);
    }
}
