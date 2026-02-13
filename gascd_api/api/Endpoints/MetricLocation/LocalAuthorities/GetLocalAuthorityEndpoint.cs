using api.Data;
using api.Data.Mappers;
using api.Data.Models.Reference;
using FastEndpoints;
using Microsoft.EntityFrameworkCore;

namespace api.Endpoints.MetricLocation.LocalAuthorities;

public class GetLocalAuthorityEndpoint(GascdDataContext context, ReferenceMapper mapper, ILogger<GetLocalAuthorityEndpoint> logger)
    : Endpoint<GetLocalAuthorityRequest, GetLocalAuthorityResponse>
{
    public override void Configure()
    {
        Get("/api/metric_locations/local_authorities/{LocalAuthorityCode}");
    }

    private LocalAuthority? QueryLocalAuthority(GetLocalAuthorityRequest req)
    {
        var laQuery = context.LocalAuthorities
            .Include(la => la.GeoData)
            .AsQueryable();

        if (req.IncludeParents)
        {
            logger.LogInformation("Including parent information.");
            laQuery = laQuery
                .Include(la => la.Region)
                .Include(la => la.Region.Country);
        }

        return laQuery.SingleOrDefault(x => x.Code == req.LocalAuthorityCode);
    }

    public override async Task HandleAsync(GetLocalAuthorityRequest req, CancellationToken ct)
    {
        logger.LogDebug("Received request for Local Authority code: {code}", req.LocalAuthorityCode);
        var la = QueryLocalAuthority(req);
        if (la == null)
        {
            logger.LogInformation("Local Authority code not found: {code}", req.LocalAuthorityCode);
            await Send.NotFoundAsync(ct);
            return;
        }

        var response = mapper.LocalAuthorityToGetLocalAuthorityResponse(la);
        logger.LogInformation("Finished processing Local Authority code: {code}", req.LocalAuthorityCode);
        await Send.OkAsync(response, ct);
    }
}