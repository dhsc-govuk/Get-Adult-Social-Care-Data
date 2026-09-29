using api.Data.Models.Metrics;
using api.Services;
using Shouldly;

namespace api.Tests.Services;

public class PeerSeriesAveragerTests
{
    private static Metric MetricWithFrequency(string frequency) => new()
    {
        Code = "num_children_in_need",
        MetricGroupFk = 1,
        FilterType = "filter",
        NumeratorDescription = "n",
        DenominatorDescription = "d",
        DataSource = "DfE",
        DataType = "numbers",
        Frequency = frequency,
    };

    private static MetricTimeSeries Series(string laCode, Metric metric, DateOnly start, DateOnly end, params decimal?[] values) => new()
    {
        StartDate = start,
        EndDate = end,
        LocationCode = laCode,
        LocationType = "LA",
        MetricFk = 1,
        Metric = metric,
        TimeSeries = values,
        LatestValue = values[^1],
    };

    private static readonly DateOnly Jan2020 = new(2020, 1, 1);
    private static readonly DateOnly Jan2021 = new(2021, 1, 1);
    private static readonly DateOnly Jan2024 = new(2024, 1, 1);
    private static readonly DateOnly Jan2025 = new(2025, 1, 1);

    [Fact]
    public void Average_AlignedPeers_AveragesEachPoint()
    {
        var metric = MetricWithFrequency("Yearly");
        var result = PeerSeriesAverager.Average(
        [
            Series("A", metric, Jan2020, Jan2021, 10m, 20m),
            Series("B", metric, Jan2020, Jan2021, 30m, 40m),
        ]);

        result.ShouldNotBeNull();
        result.PeerCount.ShouldBe(2);
        result.StartDate.ShouldBe(Jan2020);
        result.EndDate.ShouldBe(Jan2021);
        result.Frequency.ShouldBe("Yearly");
        result.Values.ShouldBe([20m, 30m]);
    }

    [Fact]
    public void Average_PeerStartingLater_ContributesToTheYearsItCovers()
    {
        // A new authority with data from 2021 must not be dropped, and must not be
        // counted for 2020
        var metric = MetricWithFrequency("Yearly");
        var result = PeerSeriesAverager.Average(
        [
            Series("A", metric, Jan2020, Jan2025, 10m, 10m, 10m, 10m, 10m, 10m),
            Series("B", metric, Jan2021, Jan2025, 30m, 30m, 30m, 30m, 30m),
        ]);

        result.ShouldNotBeNull();
        result.PeerCount.ShouldBe(2);
        result.StartDate.ShouldBe(Jan2020);
        result.EndDate.ShouldBe(Jan2025);
        result.Values.ShouldBe([10m, 20m, 20m, 20m, 20m, 20m]);
    }

    [Fact]
    public void Average_PeerEndingEarlier_LeavesLaterYearsToTheOthers()
    {
        var metric = MetricWithFrequency("Yearly");
        var result = PeerSeriesAverager.Average(
        [
            Series("A", metric, Jan2020, Jan2025, 10m, 10m, 10m, 10m, 10m, 10m),
            Series("B", metric, Jan2020, Jan2024, 30m, 30m, 30m, 30m, 30m),
        ]);

        result.ShouldNotBeNull();
        result.EndDate.ShouldBe(Jan2025);
        result.Values.ShouldBe([20m, 20m, 20m, 20m, 20m, 10m]);
    }

    [Fact]
    public void Average_NoPeerHasAValueForAPoint_ReturnsNullThere()
    {
        var metric = MetricWithFrequency("Yearly");
        var result = PeerSeriesAverager.Average(
        [
            Series("A", metric, Jan2020, Jan2021, null, 20m),
            Series("B", metric, Jan2021, Jan2021, 40m),
        ]);

        result.ShouldNotBeNull();
        result.Values.ShouldBe([null, 30m]);
    }

    [Fact]
    public void Average_DailySeries_AlignsByDay()
    {
        var metric = MetricWithFrequency("Daily");
        var result = PeerSeriesAverager.Average(
        [
            Series("A", metric, new DateOnly(2024, 1, 1), new DateOnly(2024, 1, 3), 1m, 2m, 3m),
            Series("B", metric, new DateOnly(2024, 1, 2), new DateOnly(2024, 1, 4), 4m, 5m, 6m),
        ]);

        result.ShouldNotBeNull();
        result.StartDate.ShouldBe(new DateOnly(2024, 1, 1));
        result.EndDate.ShouldBe(new DateOnly(2024, 1, 4));
        result.Values.ShouldBe([1m, 3m, 4m, 6m]);
    }

    [Fact]
    public void Average_UnknownFrequency_FallsBackToTheLargestAlignedGroup()
    {
        var metric = MetricWithFrequency("Fortnightly");
        var result = PeerSeriesAverager.Average(
        [
            Series("A", metric, Jan2020, Jan2021, 10m, 20m),
            Series("B", metric, Jan2020, Jan2021, 30m, 40m),
            Series("C", metric, Jan2021, Jan2025, 99m),
        ]);

        result.ShouldNotBeNull();
        result.PeerCount.ShouldBe(2);
        result.Values.ShouldBe([20m, 30m]);
    }

    [Fact]
    public void Average_SeriesNotFittingItsDateRange_FallsBackToTheLargestAlignedGroup()
    {
        // Three weeks declared daily but a single value: dates cannot place the points
        var metric = MetricWithFrequency("Daily");
        var march1 = new DateOnly(2021, 3, 1);
        var march21 = new DateOnly(2021, 3, 21);
        var result = PeerSeriesAverager.Average(
        [
            Series("A", metric, march1, march21, 10m),
            Series("B", metric, march1, march21, 30m),
        ]);

        result.ShouldNotBeNull();
        result.PeerCount.ShouldBe(2);
        result.StartDate.ShouldBe(march1);
        result.EndDate.ShouldBe(march21);
        result.Values.ShouldBe([20m]);
    }

    [Fact]
    public void Average_PeersWithOnlyNulls_AreNotCounted()
    {
        var metric = MetricWithFrequency("Yearly");
        var result = PeerSeriesAverager.Average(
        [
            Series("A", metric, Jan2020, Jan2021, 10m, 20m),
            Series("B", metric, Jan2020, Jan2021, null, null),
        ]);

        result.ShouldNotBeNull();
        result.PeerCount.ShouldBe(1);
        result.Values.ShouldBe([10m, 20m]);
    }

    [Fact]
    public void Average_NoPeers_ReturnsNull()
    {
        PeerSeriesAverager.Average([]).ShouldBeNull();
    }
}
