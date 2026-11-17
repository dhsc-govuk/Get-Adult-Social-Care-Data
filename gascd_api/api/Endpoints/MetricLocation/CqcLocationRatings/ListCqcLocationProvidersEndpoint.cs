using api.Data;
using FastEndpoints;
using Microsoft.EntityFrameworkCore;

namespace api.Endpoints.MetricLocation.CqcLocationRatings;

public class ListCqcLocationProvidersEndpoint(GascdDataContext context, ILogger<ListCqcLocationProvidersEndpoint> logger)
    : EndpointWithoutRequest<ListCqcLocationProvidersResponse>
{
    public override void Configure()
    {
        Get("/api/metric_locations/cqc_location_ratings/providers");
    }

    public override async Task HandleAsync(CancellationToken ct)
    {
        logger.LogDebug("Received request to list the providers of CQC locations");

        // One entry per provider, even if its name differs between its locations.
        var providers = await context.CqcLocationRatings
            .AsNoTracking()
            .GroupBy(x => x.ProviderCode)
            .Select(g => new ListCqcLocationProvidersResponse.Provider
            {
                Code = g.Key,
                Name = g.Min(x => x.ProviderName)!,
            })
            .OrderBy(x => x.Name)
            .ThenBy(x => x.Code)
            .ToListAsync(ct);

        logger.LogInformation("Finished listing {count} providers of CQC locations", providers.Count);
        await Send.OkAsync(new ListCqcLocationProvidersResponse { Providers = providers }, ct);
    }
}