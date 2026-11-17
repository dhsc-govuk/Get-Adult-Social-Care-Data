using api.Data.Models.Metrics;

namespace api.Services;

/// <summary>
/// Averages a set of local authorities' time series for one metric, point by point,
/// aligned by date rather than by array position. Peers whose series start later or end
/// earlier than the others, such as authorities created part way through the period, still
/// contribute to the dates they do cover, and the result spans the earliest start to the
/// latest end with a null wherever no peer has a value. <see cref="Sum"/> combines the same way
/// but adds the peers' values up, for metrics whose group value is a total.
/// </summary>
public static class PeerSeriesAverager
{
    public record PeerAverageSeries(
        int PeerCount,
        DateOnly StartDate,
        DateOnly EndDate,
        string Frequency,
        decimal?[] Values);

    public static PeerAverageSeries? Average(IReadOnlyList<MetricTimeSeries> peerSeries) =>
        Combine(peerSeries, (sum, count) => sum / count);

    /// <summary>
    /// Adds the peers' series up point by point. A point is the sum of the peers that have a value
    /// there, so it understates the total wherever a peer is missing a value, or when the peers
    /// cannot be aligned by date and only the largest aligned group is combined.
    /// </summary>
    public static PeerAverageSeries? Sum(IReadOnlyList<MetricTimeSeries> peerSeries) =>
        Combine(peerSeries, (sum, _) => sum);

    private static PeerAverageSeries? Combine(IReadOnlyList<MetricTimeSeries> peerSeries, Func<decimal, int, decimal> reduce)
    {
        var contributing = peerSeries.Where(x => x.TimeSeries.Any(v => v.HasValue)).ToList();
        if (contributing.Count == 0)
            return null;

        var frequency = contributing[0].Metric.Frequency;
        var step = StepFor(frequency);
        if (step is null || !contributing.All(x => FitsGrid(x, step)))
            return CombineLargestAlignedGroup(contributing, frequency, reduce);

        var gridStart = contributing.Min(x => x.StartDate);
        var gridEnd = contributing.Max(x => x.EndDate);
        var length = step.StepsBetween(gridStart, gridEnd) + 1;

        var sums = new decimal[length];
        var counts = new int[length];

        foreach (var series in contributing)
        {
            var offset = step.StepsBetween(gridStart, series.StartDate);
            for (var i = 0; i < series.TimeSeries.Length; i++)
            {
                var index = offset + i;
                if (index < 0 || index >= length || !series.TimeSeries[i].HasValue)
                    continue;
                sums[index] += series.TimeSeries[i]!.Value;
                counts[index]++;
            }
        }

        var values = new decimal?[length];
        for (var i = 0; i < length; i++)
            values[i] = counts[i] > 0 ? reduce(sums[i], counts[i]) : null;

        return new PeerAverageSeries(contributing.Count, gridStart, step.Advance(gridStart, length - 1), frequency, values);
    }

    /// <summary>
    /// Whether a series has exactly one value per step between its start and end dates.
    /// Dates can only be trusted to align the peers when every series fits its grid.
    /// </summary>
    private static bool FitsGrid(MetricTimeSeries series, ISeriesStep step) =>
        series.TimeSeries.Length == step.StepsBetween(series.StartDate, series.EndDate) + 1;

    /// <summary>
    /// Fallback for when the peers cannot be aligned by date, because the frequency's spacing
    /// is not known or a series does not fit its own date range: only the largest group of
    /// peers sharing exactly the same period can be combined position by position, preferring
    /// the most recent period on a tie.
    /// </summary>
    private static PeerAverageSeries CombineLargestAlignedGroup(
        List<MetricTimeSeries> peerSeries, string frequency, Func<decimal, int, decimal> reduce)
    {
        var aligned = peerSeries
            .GroupBy(x => (x.StartDate, x.EndDate))
            .OrderByDescending(g => g.Count())
            .ThenByDescending(g => g.Key.EndDate)
            .First()
            .ToList();

        var length = aligned.Max(x => x.TimeSeries.Length);
        var values = new decimal?[length];
        for (var i = 0; i < length; i++)
        {
            var pointValues = aligned
                .Where(x => i < x.TimeSeries.Length && x.TimeSeries[i].HasValue)
                .Select(x => x.TimeSeries[i]!.Value)
                .ToList();
            values[i] = pointValues.Count > 0 ? reduce(pointValues.Sum(), pointValues.Count) : null;
        }

        var first = aligned[0];
        return new PeerAverageSeries(aligned.Count, first.StartDate, first.EndDate, frequency, values);
    }

    /// <summary>The spacing between points for a metric frequency, as stored in the metrics table.</summary>
    private static ISeriesStep? StepFor(string frequency) => frequency switch
    {
        "Daily" => new DayStep(1),
        "Monthly" => new MonthStep(1),
        "Yearly" or "Financial yearly" or "Census" => new MonthStep(12),
        "5 years" => new MonthStep(60),
        _ => null,
    };

    private interface ISeriesStep
    {
        int StepsBetween(DateOnly from, DateOnly to);
        DateOnly Advance(DateOnly from, int steps);
    }

    private sealed record DayStep(int Days) : ISeriesStep
    {
        public int StepsBetween(DateOnly from, DateOnly to) => (to.DayNumber - from.DayNumber) / Days;
        public DateOnly Advance(DateOnly from, int steps) => from.AddDays(steps * Days);
    }

    private sealed record MonthStep(int Months) : ISeriesStep
    {
        public int StepsBetween(DateOnly from, DateOnly to) =>
            ((to.Year - from.Year) * 12 + to.Month - from.Month) / Months;
        public DateOnly Advance(DateOnly from, int steps) => from.AddMonths(steps * Months);
    }
}
