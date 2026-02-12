using api.Data;
using api.Data.Mappers;
using api.Data.Models.Reference;
using FastEndpoints;
using Microsoft.EntityFrameworkCore;
using NetTopologySuite.Geometries;

namespace api.Endpoints.Geo.CareProviderLocationNeighbours;

public class GetCareProviderLocationNeighboursEndpoint(GascdDataContext context, ReferenceMapper mapper) : Endpoint<GetCareProviderLocationNeighboursRequest, GetCareProviderLocationNeighboursResponse>
{
    public override void Configure()
    {
        Get("/api/geo/{CareProviderLocationCode}/neighbours");
    }

    public override async Task HandleAsync(GetCareProviderLocationNeighboursRequest req, CancellationToken ct)
    {
        var cpl = context.CareProviderLocations.Include(cpl => cpl.GeoData).SingleOrDefault(cpl => cpl.Code == req.CareProviderLocationCode);

        if (cpl == null || cpl.GeoData == null)
        {
            await Send.NotFoundAsync(ct);
            return;
        }

        var cplCoord = cpl.GeoData.Coordinate;

        var distanceInDegrees = req.DistanceInKm / 111.139;

        var nearbyCpls = context.CareProviderLocations
            .Include(cpl => cpl.LocalAuthority)
            .Where(cpl => cpl.GeoData.Coordinate.IsWithinDistance(cplCoord, distanceInDegrees) && cpl.Code != req.CareProviderLocationCode)
            .ToList();

        var neighbours = nearbyCpls.Select(mapper.CareProviderLocationToCareProviderLocationNeighbourResponse).ToList();

        var response = new GetCareProviderLocationNeighboursResponse { Locations = neighbours };

        await Send.OkAsync(response, ct);
    }
}