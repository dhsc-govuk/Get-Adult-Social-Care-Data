using api.Data;
using api.Services;
using FastEndpoints;
using Microsoft.EntityFrameworkCore;

namespace api.Endpoints.MetricLocation.CustomLocalAuthorityGroup;

public class GetCustomLocalAuthorityGroupEndpoint(
    GascdDataContext context,
    LocalAuthorityMetricValuesService metricValuesService,
    ILogger<GetCustomLocalAuthorityGroupEndpoint> logger)
    : Endpoint<GetCustomLocalAuthorityGroupRequest, GetCustomLocalAuthorityGroupResponse>
{
    public const int MaxLaCodes = 500;

    public override void Configure()
    {
        Get("/api/metric_locations/custom_local_authority_group");
    }

    public override async Task HandleAsync(GetCustomLocalAuthorityGroupRequest req, CancellationToken ct)
    {
        logger.LogDebug(
            "Received request for custom Local Authority group of {count} codes and Metric code: {metricCode}",
            req.LaCodes.Count, req.MetricCode);

        var requestedCodes = req.LaCodes.Distinct().ToList();

        var groupAuthorities = await context.LocalAuthorities
            .AsNoTracking()
            .Where(x => requestedCodes.Contains(x.Code))
            .Select(x => new { x.Code, x.Name })
            .ToListAsync(ct);

        var knownCodes = groupAuthorities.Select(x => x.Code).ToHashSet();
        var unknownCodes = requestedCodes.Where(x => !knownCodes.Contains(x)).ToList();
        if (unknownCodes.Count > 0)
        {
            logger.LogInformation("Unknown Local Authority codes requested: {codes}", string.Join(", ", unknownCodes));
            ThrowError($"Unknown Local Authority codes: {string.Join(", ", unknownCodes)}");
        }

        var metricValues = await metricValuesService.GetLatestValuesAsync(req.MetricCode, requestedCodes, req.RequestingLaCode, ct);

        var groupMembers = groupAuthorities
            .Select(x => new GetCustomLocalAuthorityGroupResponse.GroupMember
            {
                Code = x.Code,
                DisplayName = x.Name,
                MetricValue = metricValues.LocalAuthorityValues.GetValueOrDefault(x.Code),
            })
            .OrderByDescending(x => x.MetricValue.HasValue)
            .ThenByDescending(x => x.MetricValue)
            .ToList();

        // The requesting LA is excluded so the group average keeps the same semantics
        // as the NHS peer group average, where the source LA is never a peer of itself.
        var averageValues = groupMembers
            .Where(x => x.Code != req.RequestingLaCode && x.MetricValue.HasValue)
            .Select(x => x.MetricValue!.Value)
            .ToList();

        var response = new GetCustomLocalAuthorityGroupResponse
        {
            GroupMembers = groupMembers,
            CustomGroupAverage = averageValues.Count > 0 ? averageValues.Average() : null,
            NationalAverage = metricValues.NationalAverage,
        };

        logger.LogInformation(
            "Finished processing custom Local Authority group of {count} codes and Metric code: {metricCode}",
            requestedCodes.Count, req.MetricCode);
        await Send.OkAsync(response, ct);
    }
}