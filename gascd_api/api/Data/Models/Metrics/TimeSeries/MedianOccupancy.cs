using System.ComponentModel.DataAnnotations.Schema;

namespace api.Data.Models.Metrics.TimeSeries;

[Table("median_occupancy")]
public class MedianOccupancy : MetricTimeSeries
{

}