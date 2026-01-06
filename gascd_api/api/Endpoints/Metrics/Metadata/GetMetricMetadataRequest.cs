using FastEndpoints;

namespace api.Endpoints.Metrics.Metadata;

public class GetMetricMetadataRequest
{
    [RouteParam]
    public required string MetricCode { get; set; }
}