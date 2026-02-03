using api.Data;
using api.Data.Mappers;
using api.Data.Models.Reference;
using api.Endpoints.Shared;
using FastEndpoints;
using Microsoft.EntityFrameworkCore;

namespace api.Endpoints.MetricLocation.CpLocations;

public class GetCareProviderLocationEndpoint(GascdDataContext context, ReferenceMapper mapper, ILogger<GetCareProviderLocationEndpoint> logger)
    : Endpoint<GetCareProviderLocationRequest, GetCareProviderLocationResponse>
{
    public override void Configure()
    {
        Get("/api/metric_locations/cp_locations/{CareProviderLocationCode}");
    }

    public override async Task HandleAsync(GetCareProviderLocationRequest req, CancellationToken ct)
    {
        logger.LogDebug("Received request for care provider location: {cpl}", req.CareProviderLocationCode);

        var cpl = GetCareProviderLocation(req);

        if (cpl == null)
        {
            logger.LogInformation("Care provider location not found: {cpl}", req.CareProviderLocationCode);
            await Send.NotFoundAsync(ct);
            return;
        }

        var response = mapper.CareProviderLocationToGetCareProviderLocationResponse(cpl);
        logger.LogInformation("Finished processing care provider location: {cpl}", req.CareProviderLocationCode);
        await Send.OkAsync(response, ct);
    }

    public CareProviderLocation? GetCareProviderLocation(GetCareProviderLocationRequest req)
    {
        var cplQuery = context.CareProviderLocations
            .Include(cpl => cpl.CareProvider)
            .Include(cpl => cpl.GeoData)
            .AsQueryable();

        if (req.IncludeParents)
        {
            cplQuery = cplQuery
                .Include(cpl => cpl.LocalAuthority)
                .Include(cpl => cpl.LocalAuthority.Region)
                .Include(cpl => cpl.LocalAuthority.Region.Country);
        }

        return cplQuery.SingleOrDefault(x => x.Code == req.CareProviderLocationCode);
    }
}