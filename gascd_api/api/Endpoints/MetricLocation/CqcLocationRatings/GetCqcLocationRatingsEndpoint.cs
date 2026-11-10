using api.Data;
using FastEndpoints;
using Microsoft.EntityFrameworkCore;

namespace api.Endpoints.MetricLocation.CqcLocationRatings;

public class GetCqcLocationRatingsEndpoint(GascdDataContext context, ILogger<GetCqcLocationRatingsEndpoint> logger)
    : Endpoint<GetCqcLocationRatingsRequest, GetCqcLocationRatingsResponse>
{
    public override void Configure()
    {
        Get("/api/metric_locations/cqc_location_ratings/{LocalAuthorityCode}");
    }

    public override async Task HandleAsync(GetCqcLocationRatingsRequest req, CancellationToken ct)
    {
        logger.LogDebug("Received request for CQC location ratings for LA code: {code}, service type: {serviceType}", req.LocalAuthorityCode, req.ServiceType);

        var localAuthorityId = await context.LocalAuthorities
            .AsNoTracking()
            .Where(x => x.Code == req.LocalAuthorityCode)
            .Select(x => (int?)x.Id)
            .SingleOrDefaultAsync(ct);

        if (localAuthorityId is null)
        {
            logger.LogInformation("Local Authority code not found: {code}", req.LocalAuthorityCode);
            await Send.NotFoundAsync(ct);
            return;
        }

        var query = context.CqcLocationRatings
            .AsNoTracking()
            .Where(x => x.LocalAuthorityFk == localAuthorityId);

        // adult_social_care is every location, so it needs no filter.
        if (req.ServiceType is not null && req.ServiceType != "adult_social_care")
        {
            query = query.Where(x => x.ServiceTypes.Contains(req.ServiceType));
        }

        var locations = await query
            .OrderBy(x => x.LocationName)
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
            })
            .ToListAsync(ct);

        // The table is replaced in full each month, so its month applies to every LA, including one with no
        // locations of the requested type. No month means the table has not been loaded.
        var dataMonth = await context.CqcLocationRatings
            .AsNoTracking()
            .MaxAsync(x => (DateOnly?)x.DataMonth, ct);

        var response = new GetCqcLocationRatingsResponse
        {
            DataMonth = dataMonth,
            Locations = locations,
        };

        logger.LogInformation("Finished processing CQC location ratings for LA code: {code}", req.LocalAuthorityCode);
        await Send.OkAsync(response, ct);
    }
}