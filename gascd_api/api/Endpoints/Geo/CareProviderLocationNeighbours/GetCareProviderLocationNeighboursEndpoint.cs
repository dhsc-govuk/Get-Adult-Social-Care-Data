using api.Data;
using api.Data.Mappers;
using api.Data.Models.Reference;
using FastEndpoints;
using Microsoft.EntityFrameworkCore;

namespace api.Endpoints.Geo.CareProviderLocationNeighbours;

public class GetCareProviderLocationNeighboursEndpoint(GascdDataContext context, ReferenceMapper mapper, ILogger<GetCareProviderLocationNeighboursEndpoint> logger) : Endpoint<GetCareProviderLocationNeighboursRequest, GetCareProviderLocationNeighboursResponse>
{
    public override void Configure()
    {
        Get("/api/geo/care_provider_location/{CareProviderLocationCode}/neighbours");
    }

    public class CareProviderLocationQueryResult : CareProviderLocation
    {
        public double Distance { get; set; }
    }
    public override async Task HandleAsync(GetCareProviderLocationNeighboursRequest req, CancellationToken ct)
    {

        var distanceInMetres = req.DistanceInKm * 1000;

        var cpl = context.CareProviderLocations
            .Include(l => l.GeoData)
            .SingleOrDefault(l => l.Code == req.CareProviderLocationCode);

        if (cpl == null)
        {
            logger.LogInformation("Care provider location not found: {cpl}", req.CareProviderLocationCode);
            await Send.NotFoundAsync(ct);
            return;
        }

        var n = context.CareProviderLocations
        .Where(l => l.GeoData.Coordinate.IsWithinDistance(cpl.GeoData.Coordinate, distanceInMetres) && l.Code != req.CareProviderLocationCode)
        .Include(l => l.GeoData)
        .Include(cpl => cpl.LocalAuthority)
        .Select(n => new CareProviderLocationQueryResult
        {
            Distance = n.GeoData.Coordinate.Distance(cpl.GeoData.Coordinate),
            Name = n.Name,
            Code = n.Code,
            CareProvider = n.CareProvider,
            CareProviderFk = n.CareProviderFk,
            Address = n.Address,
            NominatedIndividual = n.NominatedIndividual,
            LocalAuthority = n.LocalAuthority,
            LocalAuthorityFk = n.LocalAuthorityFk,
            GeoData = n.GeoData,
            Category = n.Category
        }).AsQueryable();


        // IQueryable<CareProviderLocationQueryResult> nearbyCplsQuery = context.CareProviderLocations.Where(l => l.Code == req.CareProviderLocationCode)
        //     .Select(l => context.CareProviderLocations
        //         .Where(cpl => cpl.GeoData.Coordinate.IsWithinDistance(l.GeoData.Coordinate, distanceInMetres))
        //         .Select(n => new CareProviderLocationQueryResult
        //         {
        //             Distance = n.GeoData.Coordinate.Distance(l.GeoData.Coordinate),
        //             Name = n.Name,
        //             Code = n.Code,
        //             CareProvider = n.CareProvider,
        //             CareProviderFk = n.CareProviderFk,
        //             Address = n.Address,
        //             NominatedIndividual = n.NominatedIndividual,
        //             LocalAuthority = n.LocalAuthority,
        //             LocalAuthorityFk = n.LocalAuthorityFk,
        //             GeoData = n.GeoData,
        //             Category = n.Category
        //         }));

        //
        // var nearbyCplsQuery = context.CareProviderLocations
        //     .Include(cpl => cpl.LocalAuthority)
        //     .Where(l => l.GeoData != null
        //                 && l.GeoData.Coordinate
        //                     .IsWithinDistance(context.CareProviderLocations
        //                         .Where(x => x.Code == req.CareProviderLocationCode)
        //                         .Select(targetCpl => targetCpl.GeoData!.Coordinate)
        //                         .FirstOrDefault(), distanceInMetres)
        //                 && l.Code != req.CareProviderLocationCode)
        //     .OrderBy(l => l.GeoData!.Coordinate
        //         .Distance(context.CareProviderLocations
        //             .Where(x => x.Code == req.CareProviderLocationCode)
        //             .Select(targetCpl => targetCpl.GeoData!.Coordinate)
        //             .FirstOrDefault()))
        //     .Select(cpl =>
        //     {
        //         var distance = cpl.GeoData.Coordinate.Distance(context.CareProviderLocations
        //             .Where(x => x.Code == req.CareProviderLocationCode)
        //             .Select(targetCpl => targetCpl.GeoData!.Coordinate)
        //             .FirstOrDefault());
        //     })
        //     .AsQueryable();

        if (req.Limit.HasValue)
        {
            n = n.Take(req.Limit.Value);
        }

        var nearbyCpls = n.ToList();

        if (nearbyCpls.Count == 0 && context.CareProviderLocations.SingleOrDefault(cpl => cpl.Code == req.CareProviderLocationCode) == null)
        {
            logger.LogInformation("Care provider location not found: {cpl}", req.CareProviderLocationCode);
            await Send.NotFoundAsync(ct);
            return;
        }

        var response = mapper.CareProviderLocationsToGetCareProviderLocationNeighbourResponse(cpl, nearbyCpls);

        await Send.OkAsync(response, ct);

    }
}