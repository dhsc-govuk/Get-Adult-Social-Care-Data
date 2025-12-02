using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace api.Data.Models;

[Table("local_authorities")]
public class LocalAuthority
{
    [Key, Column("id"), StringLength(15)]
    public string? Id { get; init; }

    [Column("name"), StringLength(50)]
    public string? Name { get; init; }

    [Column("region_fk")]
    public string? RegionFk { get; init; }

    [ForeignKey("RegionFk")]
    public virtual Region? Region { get; init; }

    [Column("loaded_datetime"), DatabaseGenerated(DatabaseGeneratedOption.Computed)]
    public DateTime LoadedDateTime { get; init; }
}