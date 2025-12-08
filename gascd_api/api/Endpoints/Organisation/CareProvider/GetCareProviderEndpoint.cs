using api.Data;
using FastEndpoints;

namespace api.Endpoints.Organisation.CareProvider;

public class GetCareProviderEndpoint(GascdDataContext context) : Endpoint<GetCareProviderRequest, GetCareProviderResponse>
{
    public override void Configure()
    {
        Get("/organisation/care_provider/{CareProviderId}");
    }

    public override Task HandleAsync(GetCareProviderRequest req, CancellationToken ct)
    {
        return Send.OkAsync();
    }
}