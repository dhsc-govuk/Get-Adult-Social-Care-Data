using FastEndpoints;

namespace api.Endpoints.MetricFilters;

public class GetMetricFiltersRequest
{
    [RouteParam]
    public required string MetricGroupCode { get; init; }
}