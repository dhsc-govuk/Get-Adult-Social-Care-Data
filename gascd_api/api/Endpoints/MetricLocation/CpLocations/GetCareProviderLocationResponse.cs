namespace api.Endpoints.MetricLocation.CpLocations;

public class GetCareProviderLocationResponse
{
    public required string Id { get; init; }
    public required string DisplayName { get; init; }
    public required string Address { get; init; }
    public required GeoDataDTO GeoData { get; init; }
    public required string ProviderId { get; init; }
    public required string ProviderName { get; init; }
    public required string NominatedIndividual { get; init; }
    public required string LocalAuthorityId { get; init; }

}