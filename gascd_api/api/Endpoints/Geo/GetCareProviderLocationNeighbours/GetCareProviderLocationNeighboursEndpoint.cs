using FastEndpoints;

namespace api.Endpoints.Geo.GetCareProviderLocationNeighbours;

public class GetCareProviderLocationNeighboursEndpoint : Endpoint<GetCareProviderLocationNeighboursRequest, GetCareProviderLocationNeighboursResponse>
{
    public override void Configure()
    {
        Get("/api/geo/{CareProviderLocationCode}/neighbours");
    }

    public override async Task HandleAsync(GetCareProviderLocationNeighboursRequest req, CancellationToken ct)
    {
        // await Send.OkAsync(ct);
    }
}