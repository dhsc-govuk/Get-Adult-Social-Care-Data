using System.ComponentModel.DataAnnotations.Schema;

namespace api.Data.Models.Metrics.TimeSeries;

[Table("occupancy_rates")]
public class OccupancyRate : MetricTimeSeries
{

}