using api.Endpoints.Shared;

namespace api.Endpoints.MetricLocation.Regions;

public class GetRegionResponse
{
    public required string Code { get; init; }
    public required string DisplayName { get; init; }
    public required GeoDataDto GeoData { get; init; }
    public required string CountryCode { get; init; }
    public required string CountryName { get; init; }
}