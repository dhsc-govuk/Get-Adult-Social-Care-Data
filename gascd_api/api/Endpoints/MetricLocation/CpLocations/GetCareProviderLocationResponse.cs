namespace api.Endpoints.MetricLocation.CpLocations;

public class GetCareProviderLocationResponse
{
    public required string Id { get; init; }
    public required string DisplayName { get; init; }
    public required string Address { get; init; }
    public required GeoDataDto GeoData { get; init; }
    public required string ProviderId { get; init; }
    public required string ProviderName { get; init; }
    public required string NominatedIndividual { get; init; }
    public string? LocalAuthorityId { get; init; }
    public string? LocalAuthorityName { get; init; }
    public string? RegionId { get; init; }
    public string? RegionName { get; init; }
    public string? CountryId { get; init; }
    public string? CountryName { get; init; }

}