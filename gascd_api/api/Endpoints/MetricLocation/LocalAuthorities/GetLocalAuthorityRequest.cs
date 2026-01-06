using FastEndpoints;

namespace api.Endpoints.MetricLocation.LocalAuthorities;

public class GetLocalAuthorityRequest
{
    [RouteParam]
    public required string LocalAuthorityCode { get; init; }

    [QueryParam, BindFrom("include_parents")]
    public bool IncludeParents { get; init; }
}