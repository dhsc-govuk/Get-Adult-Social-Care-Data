using api.Data;
using api.Data.Mappers;
using api.Data.QueryResults;
using FastEndpoints;
using Microsoft.EntityFrameworkCore;

namespace api.Endpoints.Geo.CareProviderLocationNeighbours;

public class GetCareProviderLocationNeighboursEndpoint(GascdDataContext context, ReferenceMapper mapper, ILogger<GetCareProviderLocationNeighboursEndpoint> logger) : Endpoint<GetCareProviderLocationNeighboursRequest, GetCareProviderLocationNeighboursResponse>
{
    public override void Configure()
    {
        Get("/api/geo/care_provider_location/{CareProviderLocationCode}/neighbours");
    }

    public override async Task HandleAsync(GetCareProviderLocationNeighboursRequest req, CancellationToken ct)
    {
        var cpl = context.CareProviderLocations
            .Include(l => l.GeoData)
            .SingleOrDefault(l => l.Code == req.CareProviderLocationCode);

        if (cpl == null || cpl.GeoData == null)
        {
            logger.LogInformation("Care provider location not found: {cpl}", req.CareProviderLocationCode);
            await Send.NotFoundAsync(ct);
            return;
        }

        var cplNeighbours = context.CareProviderLocations
            .Where(l => l.GeoData!.Coordinate.IsWithinDistance(cpl.GeoData!.Coordinate, req.DistanceInMetres) &&
                        l.Code != req.CareProviderLocationCode)
            .Include(l => l.GeoData)
            .Select(n => new CareProviderLocationNeighbour
            {
                LocationName = n.Name,
                LocationCode = n.Code,
                LaName = n.LocalAuthority.Name,
                LaCode = n.LocalAuthority.Code,
                LocationCategory = n.Category,
                Address = n.Address,
                DistanceToNeighbour = (decimal)n.GeoData!.Coordinate.Distance(cpl.GeoData!.Coordinate)
            })
            .OrderBy(l => l.DistanceToNeighbour)
            .Take(req.Limit)
            .ToList();

        var response = mapper.CareProviderLocationsToGetCareProviderLocationNeighbourResponse(cpl, cplNeighbours);

        await Send.OkAsync(response, ct);
    }
}