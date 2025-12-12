using api.Data;
using FastEndpoints;
using Microsoft.EntityFrameworkCore;

namespace api.Endpoints.MetricLocation.CpLocations;

public class GetCareProviderLocationEndpoint(GascdDataContext context) : Endpoint<GetCareProviderLocationRequest, GetCareProviderLocationResponse>
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
            .First(x => x.Code == req.CareProviderLocationCode);

        var response = new GetCareProviderLocationResponse
        {
            Id = cpl.Code,
            DisplayName = cpl.Name,
            Address = cpl.Address,
            ProviderId = cpl.CareProvider.Code,
            ProviderName = cpl.CareProvider.Name,
            NominatedIndividual = cpl.NominatedIndividual,
            LocalAuthorityId = cpl.LocalAuthority.Code,
        };
        await Send.OkAsync(response, ct);
    }
}