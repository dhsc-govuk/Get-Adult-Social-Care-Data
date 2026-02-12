using FastEndpoints;

namespace api.Endpoints.Geo.CareProviderLocationNeighbours;

public class GetCareProviderLocationNeighboursRequest
{
    [RouteParam]
    public required string CareProviderLocationCode { get; init; }

}