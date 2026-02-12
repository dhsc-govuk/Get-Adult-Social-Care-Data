using api.Data.Models.Reference;

namespace api.Endpoints.Geo.CareProviderLocationNeighbours;

public class GetCareProviderLocationNeighboursResponse
{
    public required List<CareProviderLocation> Locations { get; init; }
}