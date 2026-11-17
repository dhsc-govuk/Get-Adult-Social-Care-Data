using api.Data;
using api.Data.Models.Metrics;
using api.Data.Shared;
using api.Services;
using FastEndpoints;
using Microsoft.EntityFrameworkCore;

namespace api.Endpoints.MetricLocation.LocalAuthorityPeerSeries;

/// <summary>
/// Averages each requested metric's time series across a local authority's statistical
/// peers, so the front end can draw a peer group average alongside the authority's own
/// series. The peers endpoint covers the latest value only; this covers the whole series.
/// CQC metrics combine as <see cref="CqcGroupAggregation"/> describes instead: counts are
/// summed and percentages pooled from the summed counts.
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
        // Pooled CQC percentages share denominators, so each metric's peer series is read once
        var seriesByMetric = new Dictionary<MetricCodeEnum, List<MetricTimeSeries>>();

        foreach (var metricCode in req.MetricCodes.Distinct())
        {
            var metricCodeString = metricCode.ToString();

            var averaged = CqcGroupAggregation.For(metricCode) switch
            {
                CqcGroupAggregation.Sum => PeerSeriesAverager.Sum(await PeerSeriesAsync(metricCode)),
                CqcGroupAggregation.Pooled pooled => Pool(
                    PeerSeriesAverager.Sum(await PeerSeriesAsync(pooled.Numerator)),
                    PeerSeriesAverager.Sum(await PeerSeriesAsync(pooled.Denominator)))
                    ?? PeerSeriesAverager.Average(await PeerSeriesAsync(metricCode)),
                _ => PeerSeriesAverager.Average(await PeerSeriesAsync(metricCode)),
            };
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

        async Task<List<MetricTimeSeries>> PeerSeriesAsync(MetricCodeEnum metricCode)
        {
            if (seriesByMetric.TryGetValue(metricCode, out var cached))
                return cached;

            var metricCodeString = metricCode.ToString();
            var series = await context.GetMetricTimeSeriesQueryable(metricCode)
                .AsNoTracking()
                .Include(x => x.Metric)
                .Where(x => x.Metric.Code == metricCodeString)
                .Where(x => x.LocationType == laLocationType && peerCodes.Contains(x.LocationCode))
                .ToListAsync(ct);
            seriesByMetric[metricCode] = series;
            return series;
        }
    }

    /// <summary>
    /// A pooled percentage series from the peers' summed numerator and denominator series, or
    /// null if either is missing, the two do not cover the same dates (the caller then averages
    /// the percentages instead), or no point has a denominator.
    /// </summary>
    private static PeerSeriesAverager.PeerAverageSeries? Pool(
        PeerSeriesAverager.PeerAverageSeries? numerators,
        PeerSeriesAverager.PeerAverageSeries? denominators)
    {
        if (numerators is null || denominators is null
            || numerators.StartDate != denominators.StartDate
            || numerators.Values.Length != denominators.Values.Length)
            return null;

        var values = numerators.Values
            .Select((numerator, i) => numerator.HasValue && denominators.Values[i].HasValue
                ? CqcGroupAggregation.Pool(numerator.Value, denominators.Values[i]!.Value)
                : null)
            .ToArray();

        return values.Any(x => x.HasValue) ? numerators with { Values = values } : null;
    }
}
