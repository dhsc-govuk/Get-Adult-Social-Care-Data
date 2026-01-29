using api.Data;
using api.Data.Mappers;
using FastEndpoints;
using Microsoft.EntityFrameworkCore;

namespace api.Endpoints.Metrics.Metadata;

public class GetMetricMetadataEndpoint(GascdDataContext context, MetricMapper mapper, ILogger<GetMetricMetadataEndpoint> logger) : Endpoint<GetMetricMetadataRequest, GetMetricMetadataResponse>
{
    public override void Configure()
    {
        Get("/api/metrics/{MetricCode}/metadata");
    }

    public override async Task HandleAsync(GetMetricMetadataRequest req, CancellationToken ct)
    {
        logger.LogDebug("Received request for Metric code: {code}", req.MetricCode);
        var metric = context.Metrics
            .Include(x => x.MetricGroup)
            .SingleOrDefault(x => x.Code == req.MetricCode);

        if (metric == null)
        {
            logger.LogInformation("Metric code not found: {code}", req.MetricCode);
            await Send.NotFoundAsync(ct);
            return;
        }

        var response = mapper.MetricToGetMetricMetadataResponse(metric);
        logger.LogInformation("Finished processing Metric code: {code}", req.MetricCode);
        await Send.OkAsync(response, ct);
    }
}