using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace api.Data.Models.reference;

[Table("regions")]
public class Region : EntityBase
{
    [Column("name"), StringLength(50)]
    public string? Name { get; init; }

    [Column("country_fk")]
    public string? CountryFk { get; init; }

    [ForeignKey("CountryFk")]
    public virtual Country? Country { get; init; }
}