using api.Data;
using api.Data.Mappers;
using FastEndpoints;
using Microsoft.EntityFrameworkCore;

namespace api.Endpoints.MetricLocation.Regions;

public class GetRegionEndpoint(GascdDataContext context, ReferenceMapper mapper) : Endpoint<GetRegionRequest, GetRegionResponse>
{
    public override void Configure()
    {
        Get("/api/metric_locations/regions/{RegionCode}");
    }

    public override async Task HandleAsync(GetRegionRequest req, CancellationToken ct)
    {
        var region = context.Regions
            .Include(r => r.Country)
            .Include(r => r.GeoData)
            .SingleOrDefault(x => x.Code == req.RegionCode);

        if (region == null)
        {
            await Send.NotFoundAsync(ct);
            return;
        }

        var response = mapper.RegionToGetRegionResponse(region);

        await Send.OkAsync(response, ct);
    }
}