using api.Data;
using api.Data.Mappers;
using FastEndpoints;
using Microsoft.EntityFrameworkCore;

namespace api.Endpoints.MetricLocation.CpLocations;

public class GetCareProviderLocationEndpoint(GascdDataContext context, ReferenceMapper mapper) : Endpoint<GetCareProviderLocationRequest, GetCareProviderLocationResponse>
{
    public override void Configure()
    {
        Get("/api/metric_locations/cp_locations/{CareProviderLocationCode}");
    }

    public override async Task HandleAsync(GetCareProviderLocationRequest req, CancellationToken ct)
    {
        var cpl = context.CareProviderLocations
            .Include(cpl => cpl.CareProvider)
            .Include(cpl => cpl.LocalAuthority)
            .FirstOrDefault(x => x.Code == req.CareProviderLocationCode);

        if (cpl == null)
        {
            await Send.NotFoundAsync(ct);
        }
        else
        {
            var response = mapper.CareProviderLocationToCareProviderLocationByIdResponse(cpl);
            await Send.OkAsync(response, ct);
        }
    }
}