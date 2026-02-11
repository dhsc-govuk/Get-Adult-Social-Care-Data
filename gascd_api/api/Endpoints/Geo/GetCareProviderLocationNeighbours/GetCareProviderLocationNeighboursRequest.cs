using FastEndpoints;

namespace api.Endpoints.Geo.GetCareProviderLocationNeighbours;

public class GetCareProviderLocationNeighboursRequest
{
    [RouteParam]
    public string? CareProviderCode { get; init; }
}