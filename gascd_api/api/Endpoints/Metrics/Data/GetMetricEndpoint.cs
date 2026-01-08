using api.Data;
using api.Data.Mappers;
using api.Data.Models.Metrics;
using FastEndpoints;
using Microsoft.EntityFrameworkCore;

namespace api.Endpoints.Metrics.Data;

public class GetMetricEndpoint(GascdDataContext context, MetricMapper mapper) : Endpoint<GetMetricRequest, GetMetricResponse>
{
    public override void Configure()
    {
        Get("/api/metrics/{MetricCode}/data");
    }

    public override async Task HandleAsync(GetMetricRequest req, CancellationToken ct)
    {
        IQueryable<MetricTimeSeries> query = context.GetMetricTimeSeriesQueryable(req.MetricCode);

        var data = query.Include(d => d.Metric)
            .SingleOrDefault(d => d.Metric.Code == req.MetricCode &&
                                  d.LocationCode == req.LocationCode &&
                                  d.LocationType == req.LocationType);

        if (data == null)
        {
            await Send.NotFoundAsync(ct);
            return;
        }

        var response = mapper.MetricTimeSeriesToGetMetricResponse(data);
        await Send.OkAsync(response, ct);
    }
}