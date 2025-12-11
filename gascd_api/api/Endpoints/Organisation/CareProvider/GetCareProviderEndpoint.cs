using api.Data;
using FastEndpoints;

namespace api.Endpoints.Organisation.CareProvider;

public class GetCareProviderEndpoint(GascdDataContext context) : Endpoint<GetCareProviderRequest, List<GetCareProviderResponse>>
{
    public override void Configure()
    {
        Get("/api/organisation/care_provider/{CareProviderCode}");
    }

    public override async Task HandleAsync(GetCareProviderRequest req, CancellationToken ct)
    {
        var locations = context.CareProviderLocations
            .Where(cpl => cpl.CareProvider.Code == req.CareProviderCode);

        List<GetCareProviderResponse> response = new();
        foreach (var location in locations)
        {
            response.Add(new GetCareProviderResponse
            {
                LocationName = location.Name,
                LocationId = location.Code
            });
        }
        await Send.OkAsync(response, ct);
    }
}