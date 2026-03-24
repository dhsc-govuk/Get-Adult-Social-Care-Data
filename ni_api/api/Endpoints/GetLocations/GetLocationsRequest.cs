using FastEndpoints;

namespace api.Endpoints.GetLocations;

public class GetLocationsRequest
{
    [QueryParam]
    public string? Email { get; set; }
}