using FastEndpoints;

namespace api.Endpoints.Metrics;

public class GetMetricRequest
{
    [RouteParam]
    public required string MetricCode { get; set; }

    [QueryParam]
    public required string LocationCode { get; set; }

    [QueryParam]
    public required string LocationType { get; set; }
}