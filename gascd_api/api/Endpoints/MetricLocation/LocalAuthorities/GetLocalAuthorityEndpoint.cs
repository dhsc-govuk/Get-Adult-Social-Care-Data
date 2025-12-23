using FastEndpoints;

namespace api.Endpoints.MetricLocation.LocalAuthorities;

public class GetLocalAuthorityEndpoint : Endpoint<GetLocalAuthorityRequest, GetLocalAuthorityRequest>
{
    public override void Configure()
    {
        Get("/api/metric_locations/local_authorities/{LocalAuthorityCode}");
    }

    public override async Task HandleAsync(GetLocalAuthorityRequest req, CancellationToken ct)
    {

        await Send.OkAsync();
    }
}