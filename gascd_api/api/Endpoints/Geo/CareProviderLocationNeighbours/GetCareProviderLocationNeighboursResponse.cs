namespace api.Endpoints.Geo.CareProviderLocationNeighbours;

public class GetCareProviderLocationNeighboursResponse
{
    public required List<CareProviderLocation> Locations { get; init; }
    public record CareProviderLocation
    {
        public required string LocationName { get; init; }
        public required string LocationCode { get; init; }
        public required string LaName { get; init; }
        public required string LaCode { get; init; }
        public required string LocationCategory { get; init; }
        public required string Address { get; init; }
    }
}