using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace api.Data.Models.Metrics;

public class MetricTimeSeries : EntityBase
{
    [Column("start_date")]
    public required DateTime StartDate { get; init; }

    [Column("end_date")]
    public required DateTime EndDate { get; init; }

    [Column("location_code"), StringLength(15)]
    public required string LocationCode { get; init; }

    [Column("location_type"), StringLength(25)]
    public required string LocationType { get; init; }

    [Column("metric_fk")]
    public required int MetricFk { get; init; }

    [ForeignKey("MetricFk")]
    public virtual Metric Metric { get; init; } = null!;

    [Column("time_series")]
    public required decimal[] TimeSeries { get; init; }

    [Column("latest_value")]
    public decimal LatestValue { get; init; }
}