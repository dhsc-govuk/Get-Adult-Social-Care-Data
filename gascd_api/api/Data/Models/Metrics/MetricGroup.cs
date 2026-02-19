using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace api.Data.Models.Metrics;

[Table("metric_groups")]
public class MetricGroup : EntityBase
{
    [Column("code"), StringLength(100)]
    public required string Code { get; init; }

    [Column("display_name"), StringLength(255)]
    public required string DisplayName { get; init; }

    public virtual ICollection<Metric> Metrics { get; init; } = new List<Metric>();
}