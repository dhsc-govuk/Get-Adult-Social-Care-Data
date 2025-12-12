using FastEndpoints;

namespace api.Endpoints.MetricLocation.CpLocations;

public class GetCareProviderLocationRequest
{
    [RouteParam]
    public required string CareProviderLocationCode { get; set; }
}