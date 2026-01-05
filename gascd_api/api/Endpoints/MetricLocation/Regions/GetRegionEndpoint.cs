using FastEndpoints;

namespace api.Endpoints.MetricLocation.Regions;

public class GetRegionEndpoint : Endpoint<GetRegionRequest, GetRegionResponse>
{
    public override void Configure()
    {
        Get("/api/metric_locations/regions/{RegionCode}");
    }

    public override async Task HandleAsync(GetRegionRequest req, CancellationToken ct)
    {
        await Send.OkAsync(ct);
    }
}