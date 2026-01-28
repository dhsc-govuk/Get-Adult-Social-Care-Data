using api.Data;
using api.Data.Mappers;
using api.Data.Models.Metrics;
using FastEndpoints;
using Microsoft.EntityFrameworkCore;

namespace api.Endpoints.Metrics.Data;

public class GetMetricEndpoint(GascdDataContext context, MetricMapper mapper, ILogger<GetMetricEndpoint> logger) : Endpoint<GetMetricRequest, List<GetMetricResponse>>
{
    public override void Configure()
    {
        Post("/api/metrics/{MetricCode}/data");
    }

    public override async Task HandleAsync(GetMetricRequest req, CancellationToken ct)
    {
        logger.LogDebug("Received data request for Metric code: {code}", req.MetricCode);
        var metricTimeSerieses = GetMetricTimeSeriesList(req);

        if (metricTimeSerieses.Count == 0)
        {
            logger.LogInformation("Metric time series not found for Metric code: {code}", req.MetricCode);
            await Send.NotFoundAsync(ct);
            return;
        }

        var response = metricTimeSerieses.Select(mts => mapper.MetricTimeSeriesToGetMetricResponse(mts, req.TimeSeries)).ToList();
        logger.LogInformation("Finished processing data for Metric code: {code}", req.MetricCode);
        await Send.OkAsync(response, ct);
    }

    private List<MetricTimeSeries> GetMetricTimeSeriesList(GetMetricRequest req)
    {
        var metricCodeString = req.MetricCode.ToString();

        // Create a list of "Code|Type" strings to match against
        var locationKeys = req.Locations
            .Select(l => $"{l.LocationCode}|{l.LocationType}")
            .ToList();

        // Run a single query to match all Code|Type pairings
        var results = context.GetMetricTimeSeriesQueryable(req.MetricCode)
            .Include(d => d.Metric)
            .Where(d => d.Metric.Code == metricCodeString &&
                        locationKeys.Contains(d.LocationCode + "|" + d.LocationType))
            .ToList();

        // Log missing items by comparing the input list to the results
        if (results.Count < req.Locations.Count)
        {
            var returnedKeys = results.Select(r => $"{r.LocationCode}|{r.LocationType}").ToHashSet();
            foreach (var loc in req.Locations)
            {
                if (!returnedKeys.Contains($"{loc.LocationCode}|{loc.LocationType}"))
                {
                    logger.LogInformation("Location not found: {code}, {type}", loc.LocationCode, loc.LocationType);
                }
            }
        }

        return results;
    }
}