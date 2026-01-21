using api.Data;
using api.Data.Mappers;
using FastEndpoints;
using Microsoft.EntityFrameworkCore;

namespace api.Endpoints.MetricFilters;

public class GetMetricFiltersEndpoint(GascdDataContext context, MetricMapper mapper, ILogger<GetMetricFiltersEndpoint> logger) : Endpoint<GetMetricFiltersRequest, GetMetricFiltersResponse>
{
    public override void Configure()
    {
        Get("/api/metric_filters/{MetricGroupCode}");
    }

    public override async Task HandleAsync(GetMetricFiltersRequest req, CancellationToken ct)
    {
        logger.LogDebug("Received request for metric group code: {code}", req.MetricGroupCode);
        var metricGroup = context.MetricGroups
            .Include(mg => mg.Metrics)
            .SingleOrDefault(cp => cp.Code == req.MetricGroupCode);

        if (metricGroup == null)
        {
            logger.LogInformation("Metric group code not found: {code}", req.MetricGroupCode);
            await Send.NotFoundAsync(ct);
            return;
        }

        var response = mapper.MetricGroupToMetricFiltersResponse(metricGroup);
        logger.LogInformation("Finished processing metric group code: {code}", req.MetricGroupCode);
        await Send.OkAsync(response, ct);
    }
}