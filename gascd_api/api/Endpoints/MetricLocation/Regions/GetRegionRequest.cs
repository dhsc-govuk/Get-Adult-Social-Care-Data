using FastEndpoints;

namespace api.Endpoints.MetricLocation.Regions;

public class GetRegionRequest
{
    [RouteParam]
    public required string RegionCode { get; set; }
}