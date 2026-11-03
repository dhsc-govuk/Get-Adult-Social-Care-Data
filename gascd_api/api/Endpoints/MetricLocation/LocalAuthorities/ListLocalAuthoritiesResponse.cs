namespace api.Endpoints.MetricLocation.LocalAuthorities;

public class ListLocalAuthoritiesResponse
{
    public record LocalAuthoritySummary
    {
        public required string Code { get; init; }
        public required string DisplayName { get; init; }
        public required string RegionCode { get; init; }
        public required string RegionName { get; init; }
    }

    public required List<LocalAuthoritySummary> LocalAuthorities { get; init; }
}
