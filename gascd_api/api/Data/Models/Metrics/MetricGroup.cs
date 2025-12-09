using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace api.Data.Models.Metrics;

[Table("metric_groups")]
public class MetricGroup : EntityBase
{
    [Column("name"), StringLength(100)]
    public required string Name { get; init; }
}