namespace api.Endpoints.MetricFilters;

public class GetMetricFiltersResponse
{
    public required string MetricGroupCode { get; init; }

    public required List<MetricFilterDto> MetricFilters { get; init; }

    public record MetricFilterDto
    {
        public required string MetricCode { get; init; }
        public required string DisplayName { get; init; }
    }
}