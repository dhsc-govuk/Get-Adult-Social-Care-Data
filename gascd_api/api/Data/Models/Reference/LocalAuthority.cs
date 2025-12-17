using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace api.Data.Models.Reference;

[Table("local_authorities")]
public class LocalAuthority : EntityBase
{
    [Column("name"), StringLength(50)]
    public required string Name { get; init; }

    [Column("region_fk")]
    public required int RegionFk { get; init; }

    [ForeignKey("RegionFk")]
    public virtual Region Region { get; init; } = null!;
}