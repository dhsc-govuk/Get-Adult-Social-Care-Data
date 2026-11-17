namespace api.Endpoints.MetricLocation.CqcLocationRatings;

public class GetCqcLocationRatingsResponse
{
    public record CqcLocation
    {
        public required string Code { get; init; }
        public required string Name { get; init; }
        public required string ProviderCode { get; init; }
        public required string ProviderName { get; init; }
        public required List<string> ServiceTypes { get; init; }
        public string? OverallRating { get; init; }
        public DateOnly? RatingPublished { get; init; }
    }

    public DateOnly? DataMonth { get; init; }

    /// <summary>The number of locations matching the filters, across all pages.</summary>
    public required int Total { get; init; }

    public required List<CqcLocation> Locations { get; init; }
}