using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace api.Data.Models.Reference;

[Table("regions")]
public class Region : EntityBase
{
    [Column("name"), StringLength(50)]
    public required string Name { get; init; }

    [Column("country_fk")]
    public required Guid CountryFk { get; init; }

    [ForeignKey("CountryFk")]
    public virtual Country Country { get; init; } = null!;
}