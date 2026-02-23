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
            .Where(l => l.Code == req.CareProviderLocationCode)
            .Include(l => l.GeoData)
            .Select(l => new CareProviderLocationWithNeighbours
            {
                LocationCode = l.Code,
                Neighbours = context.CareProviderLocations
                    .Where(n => n.GeoData!.Coordinate.IsWithinDistance(l.GeoData!.Coordinate, req.DistanceInMetres) &&
                                n.Code != req.CareProviderLocationCode)
                    .Include(n => n.GeoData)
                    .Select(n => new CareProviderLocationNeighbour
                    {
                        LocationName = n.Name,
                        LocationCode = n.Code,
                        LaName = n.LocalAuthority.Name,
                        LaCode = n.LocalAuthority.Code,
                        LocationCategory = n.Category,
                        Address = n.Address,
                        DistanceToNeighbour = (decimal)n.GeoData!.Coordinate.Distance(l.GeoData!.Coordinate)
                    })
                    .OrderBy(n => n.DistanceToNeighbour)
                    .Take(req.Limit)
                    .ToList()
            }).SingleOrDefault();

        if (cpl == null)
        {
            logger.LogInformation("Geographic data not found for care provider location: {cpl}", req.CareProviderLocationCode);
            await Send.NotFoundAsync(ct);
            return;
        }

        var response = mapper.CareProviderLocationsToGetCareProviderLocationNeighbourResponse(cpl);

        await Send.OkAsync(response, ct);
    }
}