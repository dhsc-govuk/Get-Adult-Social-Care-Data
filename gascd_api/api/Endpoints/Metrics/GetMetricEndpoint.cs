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
        var response = new GetMetricResponse { MetricCode = req.MetricCode, LocationCode = "location_code", LocationType = "location_type" };
        await Send.OkAsync(response, ct);
    }
}