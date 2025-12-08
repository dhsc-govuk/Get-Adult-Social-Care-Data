using api.Data.Models.Reference;
using System.ComponentModel.DataAnnotations.Schema;

namespace api.Data.Models.Metrics;

public class MetricTimeSeries : EntityBase
{
    [Column("date")]
    public required DateTime Date { get; init; }

    [Column("location_fk")]
    public required string LocationFk { get; init; }

    [Column("location_type")]
    public required string LocationType { get; init; }

    [Column("metric_fk")]
    public required string MetricFk { get; init; }

    [ForeignKey("MetricFk")]
    public virtual Metric? Metric { get; init; }

    [Column("time_series")]
    public decimal[]? TimeSeries { get; init; }
}