using api.Data.Shared;

namespace api.Services;

/// <summary>
/// How a CQC metric combines across a group of local authorities, such as a peer group or a
/// custom group. Location counts are summed, and percentages are pooled from the summed counts
/// (sum of numerators over sum of denominators), which is how the Regional and National values
/// are built. Averaging the authorities' values would instead give the typical authority's count
/// or percentage. Every other metric keeps the plain average.
/// </summary>
public static class CqcGroupAggregation
{
    public abstract record Rule;

    /// <summary>The group value is the sum of the authorities' values.</summary>
    public sealed record Sum : Rule;

    /// <summary>
    /// The group value is the sum of <paramref name="Numerator"/> over the sum of
    /// <paramref name="Denominator"/>, as a percentage to 1 decimal place.
    /// </summary>
    public sealed record Pooled(MetricCodeEnum Numerator, MetricCodeEnum Denominator) : Rule;

    private static readonly string[] Ratings =
        ["outstanding", "good", "requires_improvement", "inadequate", "insufficient_evidence"];

    /// <summary>The rule for a metric, or null when the group value is the average.</summary>
    public static Rule? For(MetricCodeEnum metricCode)
    {
        var code = metricCode.ToString();

        if (code.StartsWith("cqcr_num_") || code.StartsWith("cqci_num_"))
            return new Sum();

        // cqci_pct_<inspected|uninspected>_<service type>: share of all locations
        foreach (var status in new[] { "inspected", "uninspected" })
        {
            var prefix = $"cqci_pct_{status}_";
            if (code.StartsWith(prefix))
                return PooledOrNull($"cqci_num_{status}_{code[prefix.Length..]}", $"cqci_num_total_{code[prefix.Length..]}");
        }

        // cqcr_pct_<inspected|all>_<rating>_<service type>: share of inspected or of all locations
        foreach (var (basis, denominator) in new[] { ("inspected", "cqci_num_inspected"), ("all", "cqci_num_total") })
        {
            var prefix = $"cqcr_pct_{basis}_";
            if (!code.StartsWith(prefix))
                continue;

            var ratingAndService = code[prefix.Length..];
            var rating = Ratings.FirstOrDefault(x => ratingAndService.StartsWith($"{x}_"));
            if (rating is null)
                return null;

            var serviceType = ratingAndService[(rating.Length + 1)..];
            return PooledOrNull($"cqcr_num_{ratingAndService}", $"{denominator}_{serviceType}");
        }

        return null;
    }

    /// <summary>Sum of the numerators over the sum of the denominators as a percentage, or null if no denominator.</summary>
    public static decimal? Pool(decimal numeratorSum, decimal denominatorSum) =>
        denominatorSum > 0 ? Math.Round(numeratorSum / denominatorSum * 100, 1, MidpointRounding.AwayFromZero) : null;

    private static Pooled? PooledOrNull(string numerator, string denominator) =>
        Enum.TryParse<MetricCodeEnum>(numerator, out var n) && Enum.TryParse<MetricCodeEnum>(denominator, out var d)
            ? new Pooled(n, d)
            : null;
}
