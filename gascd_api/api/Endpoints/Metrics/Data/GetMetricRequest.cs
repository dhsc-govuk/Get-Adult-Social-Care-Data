using FastEndpoints;

namespace api.Endpoints.Metrics.Data;

public class GetMetricRequest
{
    [RouteParam]
    public required MetricCodeEnum MetricCode { get; set; }

    [QueryParam]
    public required string LocationCode { get; set; }

    [QueryParam]
    public required string LocationType { get; set; }
}