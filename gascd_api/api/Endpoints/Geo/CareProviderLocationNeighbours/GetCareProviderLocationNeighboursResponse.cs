namespace api.Endpoints.Geo.CareProviderLocationNeighbours;

public class GetCareProviderLocationNeighboursResponse
{
    public required string Code { get; init; }
    public required List<CareProviderLocationNeighbour> Locations { get; init; }
    public record CareProviderLocationNeighbour
    {
        public required decimal Distance { get; init; }
        public required CareProviderLocation LocationDetails { get; init; }
    }
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