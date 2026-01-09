using api.Data.Shared;
using FastEndpoints;

namespace api.Endpoints.Metrics.Data;

public class GetMetricRequest
{
    [RouteParam]
    public required MetricCodeEnum MetricCode { get; set; }

    [QueryParam, BindFrom("location_code")]
    public required string LocationCode { get; set; }

    [QueryParam, BindFrom("location_type")]
    public required LocationTypeEnum LocationType { get; set; }
}