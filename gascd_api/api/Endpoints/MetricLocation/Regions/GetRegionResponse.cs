using api.Endpoints.Shared;

namespace api.Endpoints.MetricLocation.Regions;

public class GetRegionResponse
{
    public required string Code { get; init; }
    public required string DisplayName { get; init; }
    public GeoDataDto? GeoData { get; init; }
    public required string CountryCode { get; init; }
    public required string CountryName { get; init; }
    public required List<LocalAuthority> LocalAuthorities { get; init; }
    public record LocalAuthority
    {
        public required string LaName { get; init; }
        public required string LaCode { get; init; }
    }

}