using FastEndpoints;
using api.Data.Shared;

namespace api.Endpoints.MetricLocation.LocalAuthorityPeers;

public class GetLocalAuthorityPeersRequest
{
    [RouteParam]
    public required string LocalAuthorityCode { get; init; }

    [QueryParam, BindFrom("metric_code")]
    public required MetricCodeEnum MetricCode { get; init; }
}