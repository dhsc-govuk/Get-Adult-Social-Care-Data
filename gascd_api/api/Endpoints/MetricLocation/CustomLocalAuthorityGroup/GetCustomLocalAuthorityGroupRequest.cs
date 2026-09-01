using FastEndpoints;
using api.Data.Shared;

namespace api.Endpoints.MetricLocation.CustomLocalAuthorityGroup;

public class GetCustomLocalAuthorityGroupRequest
{
    [QueryParam, BindFrom("la_codes")]
    public required List<string> LaCodes { get; init; }

    [QueryParam, BindFrom("metric_code")]
    public required MetricCodeEnum MetricCode { get; init; }

    [QueryParam, BindFrom("requesting_la_code")]
    public string? RequestingLaCode { get; init; }
}
