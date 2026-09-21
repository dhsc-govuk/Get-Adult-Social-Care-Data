using api.Data.Shared;
using FastEndpoints;

namespace api.Endpoints.MetricLocation.LocalAuthorityPeerSeries;

public class GetLocalAuthorityPeerSeriesRequest
{
    [RouteParam]
    public required string LocalAuthorityCode { get; init; }

    [FromBody]
    public required List<MetricCodeEnum> MetricCodes { get; init; }
}
