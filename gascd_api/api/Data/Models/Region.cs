using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace api.Data.Models;

[Table("regions")]
public class Region
{
    [Key, Column("id"), StringLength(15)]
    public string? Id { get; init; }

    [Column("name"), StringLength(50)]
    public string? Name { get; init; }

    [Column("country_fk")]
    public string? CountryFk { get; init; }

    [ForeignKey("CountryFk")]
    public virtual Country? Country { get; init; }

    [Column("loaded_datetime"), DatabaseGenerated(DatabaseGeneratedOption.Computed)]
    public DateTime LoadedDateTime { get; init; }
}