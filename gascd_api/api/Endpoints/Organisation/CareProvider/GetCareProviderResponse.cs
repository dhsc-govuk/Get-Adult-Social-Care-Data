namespace api.Endpoints.Organisation.CareProvider;

public class GetCareProviderResponse
{
    public required string Code { get; set; }
    public required string DisplayName { get; init; }
    public required List<CareProviderLocation> Locations { get; init; }

    public record CareProviderLocation
    {
        public required string LocationName { get; init; }
        public required string LocationCode { get; init; }
        public required string LocationCategory { get; init; }
        public required string Address { get; init; }
    }
}