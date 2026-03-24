using FastEndpoints;

namespace api.Endpoints.GetLocations;

public class GetLocationsEndpoint : Endpoint<GetLocationsRequest, GetLocationsResponse>
{
    public override void Configure()
    {
        Get("/api/locations");
        AllowAnonymous();
    }

    public override async Task HandleAsync(GetLocationsRequest req, CancellationToken ct)
    {
        await Send.OkAsync(ct);
    }
}