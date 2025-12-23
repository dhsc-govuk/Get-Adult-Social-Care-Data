using api.Data;
using api.Data.Mappers;
using FastEndpoints;
using Microsoft.EntityFrameworkCore;

namespace api.Endpoints.MetricLocation.LocalAuthorities;

public class GetLocalAuthorityEndpoint(GascdDataContext context, ReferenceMapper mapper) : Endpoint<GetLocalAuthorityRequest, GetLocalAuthorityResponse>
{
    public override void Configure()
    {
        Get("/api/metric_locations/local_authorities/{LocalAuthorityCode}");
    }

    public override async Task HandleAsync(GetLocalAuthorityRequest req, CancellationToken ct)
    {
        var la = context.LocalAuthorities
            .Include(la => la.GeoData)
            .SingleOrDefault(x => x.Code == req.LocalAuthorityCode);

        var response = mapper.LocalAuthorityToGetLocalAuthorityResponse(la);

        await Send.OkAsync(response, ct);
    }
}