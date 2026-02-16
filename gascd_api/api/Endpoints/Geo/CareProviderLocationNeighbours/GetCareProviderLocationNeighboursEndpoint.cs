using api.Data;
using api.Data.Mappers;
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

        var distanceInDegrees = req.DistanceInKm / 111.139;

        var nearbyCplsQuery = context.CareProviderLocations
            .Include(cpl => cpl.LocalAuthority)
            .Where(l => l.GeoData != null
                        && l.GeoData.Coordinate
                            .IsWithinDistance(context.CareProviderLocations
                                .Where(x => x.Code == req.CareProviderLocationCode)
                                .Select(targetCpl => targetCpl.GeoData!.Coordinate)
                                .FirstOrDefault(), distanceInDegrees)
                        && l.Code != req.CareProviderLocationCode)
            .OrderBy(l => l.GeoData!.Coordinate
                .Distance(context.CareProviderLocations
                    .Where(x => x.Code == req.CareProviderLocationCode)
                    .Select(targetCpl => targetCpl.GeoData!.Coordinate)
                    .FirstOrDefault()))
            .AsQueryable();

        if (req.Limit.HasValue)
        {
            nearbyCplsQuery = nearbyCplsQuery.Take(req.Limit.Value);
        }

        var nearbyCpls = nearbyCplsQuery.ToList();

        if (nearbyCpls.Count == 0 && context.CareProviderLocations.SingleOrDefault(cpl => cpl.Code == req.CareProviderLocationCode) == null)
        {
            logger.LogInformation("Care provider location not found: {cpl}", req.CareProviderLocationCode);
            await Send.NotFoundAsync(ct);
            return;
        }

        var neighbours = nearbyCpls.Select(mapper.CareProviderLocationToCareProviderLocationNeighbourResponse).ToList();

        var response = new GetCareProviderLocationNeighboursResponse { Code = req.CareProviderLocationCode, Locations = neighbours };

        await Send.OkAsync(response, ct);

    }
}