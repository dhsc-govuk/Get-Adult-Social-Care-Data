using api.Data;
using api.Data.Mappers;
using FastEndpoints;
using Microsoft.EntityFrameworkCore;

namespace api.Endpoints.Geo.CareProviderLocationNeighbours;

public class GetCareProviderLocationNeighboursEndpoint(GascdDataContext context, ReferenceMapper mapper, ILogger<GetCareProviderLocationNeighboursEndpoint> logger) : Endpoint<GetCareProviderLocationNeighboursRequest, GetCareProviderLocationNeighboursResponse>
{
    public override void Configure()
    {
        Get("/api/geo/{CareProviderLocationCode}/neighbours");
    }

    public override async Task HandleAsync(GetCareProviderLocationNeighboursRequest req, CancellationToken ct)
    {
        var cpl = context.CareProviderLocations.Include(cpl => cpl.GeoData).SingleOrDefault(cpl => cpl.Code == req.CareProviderLocationCode);

        if (cpl == null)
        {
            logger.LogInformation("Care provider location not found: {cpl}", req.CareProviderLocationCode);
            await Send.NotFoundAsync(ct);
            return;
        }

        if (cpl.GeoData == null)
        {
            logger.LogInformation("Care provider location: {cpl} has no GeoData", req.CareProviderLocationCode);
            await Send.NotFoundAsync(ct);
            return;
        }

        var cplCoord = cpl.GeoData.Coordinate;

        var distanceInDegrees = req.DistanceInKm / 111.139;

        var nearbyCpls = context.CareProviderLocations
            .Include(l => l.LocalAuthority)
            .Where(l => l.GeoData.Coordinate.IsWithinDistance(cplCoord, distanceInDegrees) && l.Code != req.CareProviderLocationCode)
            .ToList();

        var neighbours = nearbyCpls.Select(mapper.CareProviderLocationToCareProviderLocationNeighbourResponse).ToList();

        var response = new GetCareProviderLocationNeighboursResponse { Locations = neighbours };
        logger.LogInformation("Finished processing care provider location neighbours: {cpl}", req.CareProviderLocationCode);
        await Send.OkAsync(response, ct);
    }
}