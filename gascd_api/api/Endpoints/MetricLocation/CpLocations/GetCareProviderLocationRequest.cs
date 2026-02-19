using FastEndpoints;

namespace api.Endpoints.MetricLocation.CpLocations;

public class GetCareProviderLocationRequest
{
    [RouteParam]
    public required string CareProviderLocationCode { get; init; }

    [QueryParam, BindFrom("include_parents")]
    public bool IncludeParents { get; init; }
}