using api.Data;
using api.Data.Mappers;
using FastEndpoints;
using Microsoft.EntityFrameworkCore;

namespace api.Endpoints.MetricLocation.Regions;

public class GetRegionEndpoint(GascdDataContext context, ReferenceMapper mapper, ILogger<GetRegionEndpoint> logger)
    : Endpoint<GetRegionRequest, GetRegionResponse>
{
    public override void Configure()
    {
        Get("/api/metric_locations/regions/{RegionCode}");
    }

    public override async Task HandleAsync(GetRegionRequest req, CancellationToken ct)
    {
        logger.LogDebug("Received request for Region code: {code}", req.RegionCode);
        var region = context.Regions
            .Include(r => r.Country)
            .Include(r => r.GeoData)
            .Include(r => r.LocalAuthorities)
            .SingleOrDefault(x => x.Code == req.RegionCode);

        if (region == null)
        {
            logger.LogInformation("Region code not found: {code}", req.RegionCode);
            await Send.NotFoundAsync(ct);
            return;
        }

        var response = mapper.RegionToGetRegionResponse(region);
        logger.LogInformation("Finished processing region code: {code}", req.RegionCode);
        await Send.OkAsync(response, ct);
    }
}