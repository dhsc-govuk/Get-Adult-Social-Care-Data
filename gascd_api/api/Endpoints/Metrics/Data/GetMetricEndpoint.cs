using api.Data;
using api.Data.Mappers;
using api.Data.Models.Metrics;
using FastEndpoints;
using Microsoft.EntityFrameworkCore;
using System.Linq.Expressions;

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
        var query = context.GetMetricTimeSeriesQueryable(req.MetricCode).Include(d => d.Metric);

        if (!req.Locations.Any()) return new List<MetricTimeSeries>();

        var parameter = Expression.Parameter(typeof(MetricTimeSeries), "d");
        Expression? body = null;

        var metricCodeConstant = Expression.Constant(req.MetricCode.ToString());

        foreach (var loc in req.Locations)
        {
            // d.LocationCode == "X"
            var codeProp = Expression.Property(parameter, nameof(MetricTimeSeries.LocationCode));
            var codeEquals = Expression.Equal(codeProp, Expression.Constant(loc.LocationCode));

            // d.LocationType == "Y"
            var typeProp = Expression.Property(parameter, nameof(MetricTimeSeries.LocationType));
            var typeEquals = Expression.Equal(typeProp, Expression.Constant(loc.LocationType.ToString()));

            // Combine with AND
            var combinedAnd = Expression.AndAlso(codeEquals, typeEquals);

            // Combine with the rest of the list using OR
            body = body == null ? combinedAnd : Expression.OrElse(body, combinedAnd);
        }

        // Filter by MetricCode for all results
        var metricProp = Expression.Property(Expression.Property(parameter, nameof(MetricTimeSeries.Metric)), "Code");
        var metricEquals = Expression.Equal(metricProp, metricCodeConstant);

        var finalBody = Expression.AndAlso(metricEquals, body!);
        var lambda = Expression.Lambda<Func<MetricTimeSeries, bool>>(finalBody, parameter);

        return query.Where(lambda).ToList();
    }
}