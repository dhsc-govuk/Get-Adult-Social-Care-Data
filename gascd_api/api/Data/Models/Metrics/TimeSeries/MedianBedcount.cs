using System.ComponentModel.DataAnnotations.Schema;

namespace api.Data.Models.Metrics.TimeSeries;

[Table("median_bed_count")]
public class MedianBedCount : MetricTimeSeries
{

}