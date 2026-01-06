using api.Data;
using api.Data.Mappers;
using FastEndpoints;

namespace api.Endpoints.Metrics.Metadata;

public class GetMetricMetadataEndpoint(GascdDataContext context, ReferenceMapper mapper) : Endpoint<GetMetricMetadataRequest, GetMetricMetadataResponse>
{
    public override void Configure()
    {
        Get("/api/metrics/{MetricCode}/metadata");
    }

    public override async Task HandleAsync(GetMetricMetadataRequest req, CancellationToken ct)
    {
        var metric = context.Metrics.SingleOrDefault(x => x.Code == req.MetricCode);

        if (metric == null)
        {
            await Send.NotFoundAsync(ct);
            return;
        }

        var response = mapper.MetricToGetMetricMetadataResponse(metric);

        await Send.OkAsync(response, ct);
    }
}