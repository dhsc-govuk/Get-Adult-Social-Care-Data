using api.Data;
using FastEndpoints;

namespace api.Endpoints.Organisation.CareProvider;

public class GetCareProviderEndpoint() : Endpoint<GetCareProviderRequest, GetCareProviderResponse>
{
    public override void Configure()
    {
        Get("/api/organisation/care_provider/{CareProviderId}");
    }

    public override async Task HandleAsync(GetCareProviderRequest req, CancellationToken ct)
    {
        await Send.OkAsync(new GetCareProviderResponse(), ct);
    }
}