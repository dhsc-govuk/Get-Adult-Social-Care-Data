namespace api.Endpoints.Shared;

public class GetCareProviderLocationResponse
{
    public required string Code { get; init; }
    public required string DisplayName { get; init; }
    public required string Address { get; init; }
    public GeoDataDto? GeoData { get; init; }
    public required string ProviderCode { get; init; }
    public required string ProviderName { get; init; }
    public required string NominatedIndividual { get; init; }
    public string? LocalAuthorityCode { get; init; }
    public string? LocalAuthorityName { get; init; }
    public string? RegionCode { get; init; }
    public string? RegionName { get; init; }
    public string? CountryCode { get; init; }
    public string? CountryName { get; init; }

}