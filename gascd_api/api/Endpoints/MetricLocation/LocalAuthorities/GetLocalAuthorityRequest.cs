using FastEndpoints;

namespace api.Endpoints.MetricLocation.LocalAuthorities;

public class GetLocalAuthorityRequest
{
    [RouteParam]
    public required string LocalAuthorityCode { get; init; }
}