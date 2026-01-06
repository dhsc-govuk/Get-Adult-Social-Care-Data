using FastEndpoints;

namespace api.Endpoints.Metrics.Metadata;

public class GetMetricMetadataEndpoint : Endpoint<GetMetricMetadataRequest, GetMetricMetadataResponse>
{
    public override void Configure()
    {
        Get("/api/metrics/{MetricCode}/metadata");
    }

    public override async Task HandleAsync(GetMetricMetadataRequest req, CancellationToken ct)
    {
        await Send.OkAsync(ct);
    }
}