using api.Data;
using FastEndpoints;
using Microsoft.EntityFrameworkCore;

namespace api.Endpoints.Metrics;

public class GetMetricEndpoint(GascdDataContext context) : Endpoint<GetMetricRequest, GetMetricResponse>
{
    public override void Configure()
    {
        Get("/api/metrics/{MetricCode}/data");
    }

    public override async Task HandleAsync(GetMetricRequest req, CancellationToken ct)
    {
        var data = context.BedcountSet
            .Include(d => d.Metric)
            .SingleOrDefault(d => d.Metric.Code == req.MetricCode &&
                                  d.LocationCode == req.LocationCode &&
                                  d.LocationType == req.LocationType);

        var response = new GetMetricResponse
        {
            MetricCode = data.Metric.Code,
            LocationCode = data.LocationCode,
            LocationType = data.LocationType,
            SeriesStartDate = data.StartDate,
            SeriesFrequency = data.Metric.Frequency,
            Values = [data.LatestValue]
        };
        await Send.OkAsync(response, ct);
    }
}