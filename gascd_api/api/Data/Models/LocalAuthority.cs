using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace api.Data.Models;

[Table("local_authorities")]
public class LocalAuthority
{
    [Key]
    [Column("id")]
    public string? LaCode { get; init; }

    [Column("name")]
    public string? Name { get; init; }

    [Column("region_fk")]
    public string? RegionFk { get; init; }

    [ForeignKey("RegionFk")]
    public virtual Region? Region { get; init; }

    [Column("loaded_datetime"), DatabaseGenerated(DatabaseGeneratedOption.Computed)]
    public DateTime LoadedDateTime { get; init; }

}