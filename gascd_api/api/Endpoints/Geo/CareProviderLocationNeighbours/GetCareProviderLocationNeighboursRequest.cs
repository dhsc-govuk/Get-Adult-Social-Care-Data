using FastEndpoints;

namespace api.Endpoints.Geo.CareProviderLocationNeighbours;

public class GetCareProviderLocationNeighboursRequest
{
    [RouteParam]
    public required string CareProviderLocationCode { get; init; }

    [QueryParam, BindFrom("distance_in_km")]
    public int DistanceInKm { get; init; } = 5;

    [QueryParam, BindFrom("limit")]
    public int Limit { get; init; } = 100;

    public virtual int DistanceInMetres => DistanceInKm * 1000;
}