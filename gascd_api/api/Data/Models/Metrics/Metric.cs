using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace api.Data.Models.Metrics;

[Table("metrics")]
public class Metric : EntityBase
{
    [Column("code"), StringLength(100)]
    public required string Code { get; init; }

    [Column("metric_group_fk")]
    public required int MetricGroupFk { get; init; }

    [ForeignKey("MetricGroupFk")]
    public virtual MetricGroup MetricGroup { get; set; } = null!;

    [Column("filter_type"), StringLength(255)]
    public required string FilterType { get; init; }

    [Column("numerator_description"), StringLength(255)]
    public required string NumeratorDescription { get; init; }

    [Column("denominator_description"), StringLength(255)]
    public required string DenominatorDescription { get; init; }

    [Column("data_source"), StringLength(40)]
    public required string DataSource { get; init; }

    [Column("data_type"), StringLength(50)]
    public required string DataType { get; init; }

    [Column("frequency"), StringLength(25)]
    public required string Frequency { get; init; }
}