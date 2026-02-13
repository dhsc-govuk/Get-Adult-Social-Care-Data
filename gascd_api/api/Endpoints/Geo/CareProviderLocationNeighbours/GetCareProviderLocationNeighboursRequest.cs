using FastEndpoints;

namespace api.Endpoints.Geo.CareProviderLocationNeighbours;

public class GetCareProviderLocationNeighboursRequest
{
    [RouteParam]
    public required string CareProviderLocationCode { get; init; }

    [QueryParam]
    public int DistanceInKm { get; init; } = 5;

    [QueryParam]
    public int? Limit { get; init; }
}