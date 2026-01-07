using FastEndpoints;

namespace api.Endpoints.Metrics;

public class GetMetricRequest
{
    [RouteParam]
    public required string MetricCode { get; set; }
}