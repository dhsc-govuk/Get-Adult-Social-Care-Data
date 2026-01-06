using api.Endpoints.Shared;

namespace api.Endpoints.MetricLocation.Countries;

public class GetCountryResponse
{
    public required string Code { get; init; }
    public required string DisplayName { get; init; }
    public required GeoDataDto GeoData { get; init; }
}