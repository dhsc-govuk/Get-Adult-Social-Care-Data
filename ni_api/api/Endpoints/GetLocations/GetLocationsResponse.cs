namespace api.Endpoints.GetLocations;

public class GetLocationsResponse
{
    public required string Email { get; init; }
    public required List<Location> Locations { get; init; }
    
    public record Location
    {
        public required string Code { get; init; }
    }
}