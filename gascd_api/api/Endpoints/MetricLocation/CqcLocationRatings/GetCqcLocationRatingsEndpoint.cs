using api.Data;
using FastEndpoints;
using Microsoft.EntityFrameworkCore;

namespace api.Endpoints.MetricLocation.CqcLocationRatings;

public class GetCqcLocationRatingsEndpoint(GascdDataContext context, ILogger<GetCqcLocationRatingsEndpoint> logger)
    : Endpoint<GetCqcLocationRatingsRequest, GetCqcLocationRatingsResponse>
{
    public override void Configure()
    {
        Get("/api/metric_locations/cqc_location_ratings");
    }

    public override async Task HandleAsync(GetCqcLocationRatingsRequest req, CancellationToken ct)
    {
        logger.LogDebug("Received request for CQC location ratings");

        var query = context.CqcLocationRatings.AsNoTracking();

        if (req.LaCodes is { Count: > 0 })
        {
            query = query.Where(x => req.LaCodes.Contains(x.LocalAuthority.Code));
        }

        if (req.ProviderCodes is { Count: > 0 })
        {
            query = query.Where(x => req.ProviderCodes.Contains(x.ProviderCode));
        }

        // Every location has adult_social_care among its service types, so that type matches them all.
        if (req.ServiceTypes is { Count: > 0 })
        {
            query = query.Where(x => x.ServiceTypes.Any(serviceType => req.ServiceTypes.Contains(serviceType)));
        }

        if (req.Ratings is { Count: > 0 })
        {
            query = query.Where(x => x.OverallRating != null && req.Ratings.Contains(x.OverallRating));
        }

        if (!string.IsNullOrWhiteSpace(req.Search))
        {
            // The search is plain text, so the pattern characters are matched as themselves.
            var pattern = req.Search.Trim().Replace("\\", "\\\\").Replace("%", "\\%").Replace("_", "\\_");
            query = query.Where(x => EF.Functions.ILike(x.LocationName, $"%{pattern}%", "\\"));
        }

        var total = await query.CountAsync(ct);

        // Most recently rated first, with locations not yet inspected last.
        var ordered = query
            .OrderBy(x => x.RatingPublished == null)
            .ThenByDescending(x => x.RatingPublished)
            .ThenBy(x => x.LocationName)
            .ThenBy(x => x.LocationCode)
            .Select(x => new GetCqcLocationRatingsResponse.CqcLocation
            {
                Code = x.LocationCode,
                Name = x.LocationName,
                ProviderCode = x.ProviderCode,
                ProviderName = x.ProviderName,
                ServiceTypes = x.ServiceTypes,
                OverallRating = x.OverallRating,
                RatingPublished = x.RatingPublished,
            });

        if (req.PageSize is { } pageSize)
        {
            ordered = ordered.Skip(((req.Page ?? 1) - 1) * pageSize).Take(pageSize);
        }

        var locations = await ordered.ToListAsync(ct);

        // The table is replaced in full each month, so its month applies whatever the filters, including when
        // no location matches them. No month means the table has not been loaded.
        var dataMonth = await context.CqcLocationRatings
            .AsNoTracking()
            .MaxAsync(x => (DateOnly?)x.DataMonth, ct);

        var response = new GetCqcLocationRatingsResponse
        {
            DataMonth = dataMonth,
            Total = total,
            Locations = locations,
        };

        logger.LogInformation("Finished processing CQC location ratings: {count} of {total} locations", locations.Count, total);
        await Send.OkAsync(response, ct);
    }
}