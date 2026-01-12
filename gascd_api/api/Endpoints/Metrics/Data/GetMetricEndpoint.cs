using api.Data;
using api.Data.Mappers;
using api.Data.Models.Metrics;
using FastEndpoints;
using Microsoft.EntityFrameworkCore;

namespace api.Endpoints.Metrics.Data;

public class GetMetricEndpoint(GascdDataContext context, MetricMapper mapper) : Endpoint<GetMetricRequest, List<GetMetricResponse>>
{
    public override void Configure()
    {
        Post("/api/metrics/{MetricCode}/data");
    }

    public override async Task HandleAsync(GetMetricRequest req, CancellationToken ct)
    {
        var metricTimeSerieses = GetMetricTimeSerieses(req);

        var response = metricTimeSerieses.Select(mts => mapper.MetricTimeSeriesToGetMetricResponse(mts, req.TimeSeries)).ToList();
        await Send.OkAsync(response, ct);
    }

    private List<MetricTimeSeries> GetMetricTimeSerieses(GetMetricRequest req)
    {
        List<MetricTimeSeries> metricTimeSerieses = new();
        foreach (GetMetricRequest.Location location in req.Locations)
        {
            IQueryable<MetricTimeSeries> query = context.GetMetricTimeSeriesQueryable(req.MetricCode);

            var data = query.Include(d => d.Metric)
                .SingleOrDefault(d => d.Metric.Code == req.MetricCode.ToString() &&
                                      d.LocationCode == location.LocationCode &&
                                      d.LocationType == location.LocationType.ToString());

            metricTimeSerieses.Add(data);
        }
        return metricTimeSerieses;
    }
}