using api.Data;
using api.Data.Mappers;
using api.Data.Models.Metrics;
using api.Data.Shared;
using FastEndpoints;
using Microsoft.EntityFrameworkCore;
using System.Linq.Expressions;
using static System.Linq.Expressions.Expression;

namespace api.Endpoints.Metrics.Data;

public class GetMetricEndpoint(GascdDataContext context, MetricMapper mapper, ILogger<GetMetricEndpoint> logger)
    : Endpoint<GetMetricRequest, List<GetMetricResponse>>
{
    public override void Configure()
    {
        Post("/api/metrics/{MetricCode}/data");
    }

    public override async Task HandleAsync(GetMetricRequest req, CancellationToken ct)
    {
        logger.LogDebug("Received data request for Metric code: {code}", req.MetricCode);
        var timeSeries = GetMetricTimeSeriesList(req);

        if (timeSeries.Count == 0)
        {
            logger.LogInformation("Metric time series not found for Metric code: {code}", req.MetricCode);
            await Send.NotFoundAsync(ct);
            return;
        }

        var response = timeSeries.Select(mts => mapper.MetricTimeSeriesToGetMetricResponse(mts, req.TimeSeries)).ToList();
        logger.LogInformation("Finished processing data for Metric code: {code}", req.MetricCode);
        await Send.OkAsync(response, ct);
    }

    private List<MetricTimeSeries> GetMetricTimeSeriesList(GetMetricRequest req)
    {
        if (!req.Locations.Any())
            return [];

        var timeSeriesParam = Parameter(typeof(MetricTimeSeries));

        var locations = req.Locations.Select(l => LocationEquals(timeSeriesParam, l.LocationCode, l.LocationType)).ToList();
        var locationCriteria = locations.Skip(1).Aggregate(locations.First(), OrElse);

        var metricProp = Property(timeSeriesParam, nameof(MetricTimeSeries.Metric));
        var metricCriterion = PropertyEquals(metricProp, nameof(Metric.Code), req.MetricCode.ToString());

        var criteria = AndAlso(metricCriterion, locationCriteria);

        var lambda = Lambda<Func<MetricTimeSeries, bool>>(criteria, timeSeriesParam);

        return context.GetMetricTimeSeriesQueryable(req.MetricCode)
            .Include(d => d.Metric)
            .Where(lambda)
            .ToList();
    }

    private BinaryExpression LocationEquals(Expression timeSeries, string locationCode, LocationTypeEnum type)
    {
        var codeEquals = PropertyEquals(timeSeries, nameof(MetricTimeSeries.LocationCode), locationCode);
        var typeEquals = PropertyEquals(timeSeries, nameof(MetricTimeSeries.LocationType), type.ToString());

        return AndAlso(codeEquals, typeEquals);
    }

    private BinaryExpression PropertyEquals(Expression param, string propertyName, string propertyValue)
    {
        var prop = Property(param, propertyName);
        var constant = Constant(propertyValue);
        return Equal(prop, constant);
    }
}