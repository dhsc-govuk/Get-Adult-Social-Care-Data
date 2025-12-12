using FastEndpoints;

namespace api.Endpoints.MetricLocation.CpLocations;

public class GetCareProviderLocationEndpoint : Endpoint<GetCareProviderLocationRequest, GetCareProviderLocationResponse>
{
    public override void Configure()
    {
        Get("/api/metric_locations/cp_locations/{CareProviderLocationCode}");
    }

    public override async Task HandleAsync(GetCareProviderLocationRequest req, CancellationToken ct)
    {
        await Send.OkAsync(ct);
    }
}