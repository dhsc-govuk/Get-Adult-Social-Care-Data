using api.Data;
using api.Data.Mappers;
using FastEndpoints;

namespace api.Endpoints.Organisation.CareProvider;

public class GetCareProviderEndpoint(GascdDataContext context, ReferenceMapper mapper) : Endpoint<GetCareProviderRequest, List<GetCareProviderResponse>>
{
    public override void Configure()
    {
        Get("/api/organisation/care_provider/{CareProviderCode}");
    }

    public override async Task HandleAsync(GetCareProviderRequest req, CancellationToken ct)
    {
        var locations = context.CareProviderLocations
            .Where(cpl => cpl.CareProvider.Code == req.CareProviderCode);

        if (!locations.Any() && !context.CareProviders.Any(cp => cp.Code == req.CareProviderCode))
        {
            await Send.NotFoundAsync(ct);
            return;
        }

        List<GetCareProviderResponse> response =
            locations.Select(l => mapper.CareProviderLocationToCareProviderLocationResponse(l)).ToList();

        await Send.OkAsync(response, ct);
    }
}