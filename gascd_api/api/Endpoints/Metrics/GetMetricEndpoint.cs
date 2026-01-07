using FastEndpoints;

namespace api.Endpoints.Metrics;

public class GetMetricEndpoint : Endpoint<GetMetricRequest, GetMetricResponse>
{
    public override void Configure()
    {
        Get("/api/metrics/{MetricCode}/data");
    }

    public override async Task HandleAsync(GetMetricRequest req, CancellationToken ct)
    {
        await Send.OkAsync(ct);
    }
}