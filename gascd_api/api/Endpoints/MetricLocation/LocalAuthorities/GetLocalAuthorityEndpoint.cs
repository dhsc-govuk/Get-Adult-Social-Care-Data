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
        var laQuery = context.LocalAuthorities
            .Include(la => la.GeoData)
            .AsQueryable();

        if (req.IncludeParents)
        {
            laQuery = laQuery
                .Include(la => la.Region)
                .Include(la => la.Region.Country);
        }

        var la = laQuery.SingleOrDefault(x => x.Code == req.LocalAuthorityCode);

        if (la == null)
        {
            await Send.NotFoundAsync(ct);
            return;
        }

        var response = mapper.LocalAuthorityToGetLocalAuthorityResponse(la);

        await Send.OkAsync(response, ct);
    }
}