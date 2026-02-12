using api.Data;
using api.Data.Models.Reference;
using FastEndpoints;
using Microsoft.EntityFrameworkCore;
using NetTopologySuite.Geometries;

namespace api.Endpoints.Geo.CareProviderLocationNeighbours;

public class GetCareProviderLocationNeighboursEndpoint(GascdDataContext context) : Endpoint<GetCareProviderLocationNeighboursRequest, GetCareProviderLocationNeighboursResponse>
{
    public override void Configure()
    {
        Get("/api/geo/{CareProviderLocationCode}/neighbours");
    }

    public override async Task HandleAsync(GetCareProviderLocationNeighboursRequest req, CancellationToken ct)
    {
        var cpl = context.CareProviderLocations.Include(cpl => cpl.GeoData).SingleOrDefault(cpl => cpl.Code == req.CareProviderLocationCode);
        var cplCoord = cpl.GeoData.Coordinate;

        var distanceInDegrees = req.DistanceInKm / 111.139;

        var neighbours = context.CareProviderLocations
            .Where(cpl => cpl.GeoData.Coordinate.IsWithinDistance(cplCoord, distanceInDegrees) && cpl.Code != req.CareProviderLocationCode)
            .ToList();

        var response = new GetCareProviderLocationNeighboursResponse { Locations = neighbours };

        await Send.OkAsync(response, ct);
    }
}