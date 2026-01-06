using api.Endpoints.Shared;

namespace api.Endpoints.MetricLocation.LocalAuthorities;

public class GetLocalAuthorityResponse
{
    public required string Code { get; init; }
    public required string DisplayName { get; init; }
    public required GeoDataDto GeoData { get; init; }
    public string? RegionCode { get; init; }
    public string? RegionName { get; init; }
    public string? CountryCode { get; init; }
    public string? CountryName { get; init; }

}