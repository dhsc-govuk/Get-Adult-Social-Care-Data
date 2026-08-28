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
}