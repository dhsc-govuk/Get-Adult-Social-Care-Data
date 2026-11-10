using FastEndpoints;

namespace api.Endpoints.MetricLocation.CqcLocationRatings;

public class GetCqcLocationRatingsRequest
{
    [RouteParam]
    public required string LocalAuthorityCode { get; init; }

    [QueryParam, BindFrom("service_type")]
    public string? ServiceType { get; init; }
}