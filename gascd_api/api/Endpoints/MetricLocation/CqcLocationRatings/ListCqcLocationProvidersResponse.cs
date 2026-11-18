namespace api.Endpoints.MetricLocation.CqcLocationRatings;

public class ListCqcLocationProvidersResponse
{
    public record Provider
    {
        public required string Code { get; init; }
        public required string Name { get; init; }
    }

    public required List<Provider> Providers { get; init; }
}