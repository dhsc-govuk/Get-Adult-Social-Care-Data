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
        var response = new GetLocationsResponse
        {
            Email =  req.Email,
            Locations =
            [
                new() { Code = "1-12345" },
                new() { Code = "1-12346" }
            ]
        };
        await Send.OkAsync(response, ct);
    }
}