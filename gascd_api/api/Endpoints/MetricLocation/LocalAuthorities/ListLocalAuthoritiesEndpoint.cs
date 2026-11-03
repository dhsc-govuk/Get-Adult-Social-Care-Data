using api.Data;
using FastEndpoints;
using Microsoft.EntityFrameworkCore;

namespace api.Endpoints.MetricLocation.LocalAuthorities;

public class ListLocalAuthoritiesEndpoint(GascdDataContext context, ILogger<ListLocalAuthoritiesEndpoint> logger)
    : EndpointWithoutRequest<ListLocalAuthoritiesResponse>
{
    public override void Configure()
    {
        Get("/api/metric_locations/local_authorities");
    }

    public override async Task HandleAsync(CancellationToken ct)
    {
        logger.LogDebug("Received request to list all Local Authorities");

        var localAuthorities = await context.LocalAuthorities
            .AsNoTracking()
            .OrderBy(x => x.Name)
            .Select(x => new ListLocalAuthoritiesResponse.LocalAuthoritySummary
            {
                Code = x.Code,
                DisplayName = x.Name,
                RegionCode = x.Region.Code,
                RegionName = x.Region.Name,
            })
            .ToListAsync(ct);

        logger.LogInformation("Finished listing {count} Local Authorities", localAuthorities.Count);
        await Send.OkAsync(new ListLocalAuthoritiesResponse { LocalAuthorities = localAuthorities }, ct);
    }
}
