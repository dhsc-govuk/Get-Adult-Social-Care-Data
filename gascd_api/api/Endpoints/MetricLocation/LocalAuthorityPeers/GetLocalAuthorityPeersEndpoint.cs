using api.Data;
using api.Data.Shared;
using FastEndpoints;
using Microsoft.EntityFrameworkCore;

namespace api.Endpoints.MetricLocation.LocalAuthorityPeers;

public class GetLocalAuthorityPeersEndpoint(GascdDataContext context, ILogger<GetLocalAuthorityPeersEndpoint> logger)
    : Endpoint<GetLocalAuthorityPeersRequest, GetLocalAuthorityPeersResponse>
{
    public override void Configure()
    {
        Get("/api/metric_locations/local_authority_peers/{LocalAuthorityCode}");
    }

    public override async Task HandleAsync(GetLocalAuthorityPeersRequest req, CancellationToken ct)
    {
        logger.LogDebug("Received request for Local Authority peers for LA code: {code} and Metric code: {metricCode}", req.LocalAuthorityCode, req.MetricCode);

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

        var metricCode = req.MetricCode.ToString();
        var laLocationType = LocationTypeEnum.LA.ToString();
        var nationalLocationType = LocationTypeEnum.National.ToString();

        var metricTimeSeriesQueryable = context.GetMetricTimeSeriesQueryable(req.MetricCode)
            .AsNoTracking();

        var peerRows = await context.LocalAuthorityPeers
            .AsNoTracking()
            .Where(x => x.LocalAuthorityFk == sourceLocalAuthorityId)
            .Select(x => new
            {
                x.PeerRank,
                PeerCode = x.PeerLocalAuthority.Code,
                PeerName = x.PeerLocalAuthority.Name,
            })
            .OrderBy(x => x.PeerRank)
            .ToListAsync(ct);

        var peerCodes = peerRows.Select(x => x.PeerCode).ToList();

        var metricRows = await metricTimeSeriesQueryable
            .Where(x => x.Metric.Code == metricCode)
            .Where(x =>
                (x.LocationType == laLocationType && peerCodes.Contains(x.LocationCode)) ||
                x.LocationType == nationalLocationType)
            .Select(x => new { x.LocationCode, x.LocationType, x.LatestValue })
            .ToListAsync(ct);

        var peerMetricLookup = metricRows
            .Where(x => x.LocationType == laLocationType)
            .ToDictionary(x => x.LocationCode, x => x.LatestValue);

        var localAuthorityPeers = peerRows
            .Select(x => new GetLocalAuthorityPeersResponse.LocalAuthorityPeer
            {
                Code = x.PeerCode,
                DisplayName = x.PeerName,
                PeerRanking = x.PeerRank,
                MetricValue = peerMetricLookup.GetValueOrDefault(x.PeerCode),
            })
            .OrderByDescending(x => x.MetricValue.HasValue)
            .ThenByDescending(x => x.MetricValue)
            .ToList();

        var peerValues = localAuthorityPeers
            .Where(x => x.MetricValue.HasValue)
            .Select(x => x.MetricValue!.Value)
            .ToList();

        var nationalAverage = metricRows
            .Where(x => x.LocationType == nationalLocationType)
            .Select(x => x.LatestValue)
            .FirstOrDefault();

        var response = new GetLocalAuthorityPeersResponse
        {
            LocalAuthorityPeers = localAuthorityPeers,
            AveragePeerGroup = peerValues.Count > 0 ? peerValues.Average() : null,
            NationalAverage = nationalAverage
        };

        logger.LogInformation("Finished processing Local Authority peers for LA code: {code} and Metric code: {metricCode}", req.LocalAuthorityCode, req.MetricCode);
        await Send.OkAsync(response, ct);
    }
}