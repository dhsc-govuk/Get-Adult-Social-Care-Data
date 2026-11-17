using api.Data;
using api.Data.Shared;
using Microsoft.EntityFrameworkCore;

namespace api.Services;

public class LocalAuthorityMetricValuesService(GascdDataContext context)
{
    public record MetricValuesResult(
        Dictionary<string, decimal?> LocalAuthorityValues,
        decimal? NationalAverage);

    /// <summary>
    /// Latest metric values for a set of Local Authorities, plus the national value for the
    /// country those authorities belong to.
    /// </summary>
    /// <param name="laCodes">Local Authorities to fetch values for.</param>
    /// <param name="requestingLaCode">
    /// The LA the request is on behalf of. Only used, together with <paramref name="laCodes"/>,
    /// to resolve which country's National row to return, so the national figure always
    /// matches the one the front end shows for that LA elsewhere.
    /// </param>
    public async Task<MetricValuesResult> GetLatestValuesAsync(
        MetricCodeEnum metricCode,
        List<string> laCodes,
        string? requestingLaCode,
        CancellationToken ct)
    {
        var metricCodeString = metricCode.ToString();
        var laLocationType = LocationTypeEnum.LA.ToString();
        var nationalLocationType = LocationTypeEnum.National.ToString();

        // National rows are stored per country code, so resolve the country of the
        // authorities involved rather than taking an arbitrary National row.
        var countryLookupCodes = requestingLaCode is null
            ? laCodes
            : laCodes.Append(requestingLaCode).ToList();

        var countryCodes = await context.LocalAuthorities
            .AsNoTracking()
            .Where(x => countryLookupCodes.Contains(x.Code))
            .Select(x => x.Region.Country.Code)
            .Distinct()
            .ToListAsync(ct);

        var metricRows = await context.GetMetricTimeSeriesQueryable(metricCode)
            .AsNoTracking()
            .Where(x => x.Metric.Code == metricCodeString)
            .Where(x =>
                (x.LocationType == laLocationType && laCodes.Contains(x.LocationCode)) ||
                (x.LocationType == nationalLocationType && countryCodes.Contains(x.LocationCode)))
            .Select(x => new { x.LocationCode, x.LocationType, x.LatestValue })
            .ToListAsync(ct);

        var localAuthorityValues = metricRows
            .Where(x => x.LocationType == laLocationType)
            .ToDictionary(x => x.LocationCode, x => x.LatestValue);

        var nationalAverage = metricRows
            .Where(x => x.LocationType == nationalLocationType)
            .OrderBy(x => x.LocationCode)
            .Select(x => x.LatestValue)
            .FirstOrDefault();

        return new MetricValuesResult(localAuthorityValues, nationalAverage);
    }

    /// <summary>
    /// The value for a group of Local Authorities, such as a peer group. CQC location counts are
    /// summed and CQC percentages pooled from the summed counts (see <see cref="CqcGroupAggregation"/>);
    /// every other metric is the average of the members' values.
    /// </summary>
    /// <param name="memberValues">Each group member's latest value for <paramref name="metricCode"/>, null where it has none.</param>
    public async Task<decimal?> GetGroupValueAsync(
        MetricCodeEnum metricCode,
        IReadOnlyDictionary<string, decimal?> memberValues,
        CancellationToken ct)
    {
        var values = memberValues.Values.Where(x => x.HasValue).Select(x => x!.Value).ToList();

        switch (CqcGroupAggregation.For(metricCode))
        {
            case CqcGroupAggregation.Sum:
                return values.Count > 0 ? values.Sum() : null;

            case CqcGroupAggregation.Pooled pooled:
                var memberCodes = memberValues.Keys.ToList();
                var numerators = await GetLatestLocalAuthorityValuesAsync(pooled.Numerator, memberCodes, ct);
                var denominators = await GetLatestLocalAuthorityValuesAsync(pooled.Denominator, memberCodes, ct);
                var counted = memberCodes
                    .Where(x => numerators.GetValueOrDefault(x).HasValue && denominators.GetValueOrDefault(x).HasValue)
                    .ToList();
                return counted.Count > 0
                    ? CqcGroupAggregation.Pool(counted.Sum(x => numerators[x]!.Value), counted.Sum(x => denominators[x]!.Value))
                    : null;

            default:
                return values.Count > 0 ? values.Average() : null;
        }
    }

    private async Task<Dictionary<string, decimal?>> GetLatestLocalAuthorityValuesAsync(
        MetricCodeEnum metricCode,
        List<string> laCodes,
        CancellationToken ct)
    {
        var metricCodeString = metricCode.ToString();
        var laLocationType = LocationTypeEnum.LA.ToString();

        return await context.GetMetricTimeSeriesQueryable(metricCode)
            .AsNoTracking()
            .Where(x => x.Metric.Code == metricCodeString)
            .Where(x => x.LocationType == laLocationType && laCodes.Contains(x.LocationCode))
            .ToDictionaryAsync(x => x.LocationCode, x => x.LatestValue, ct);
    }
}