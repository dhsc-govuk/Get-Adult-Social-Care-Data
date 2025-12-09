using System.ComponentModel.DataAnnotations.Schema;

namespace api.Data.Models.Metrics.TimeSeries;

[Table("perc_75over")]
public class Perc75Over : MetricTimeSeries
{

}