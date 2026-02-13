using FastEndpoints;

namespace api.Endpoints.Organisation.CareProvider;

public class GetCareProviderRequest
{
    [RouteParam]
    public required string CareProviderCode { get; init; }
}