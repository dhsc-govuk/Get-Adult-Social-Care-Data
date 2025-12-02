using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace api.Data.Models;

[Table("countries")]
public class Country
{
    [Key, Column("id"), StringLength(15)]
    public new string? Id { get; init; }

    [Column("name"), StringLength(50)]
    public string? Name { get; init; }

    [Column("loaded_datetime"), DatabaseGenerated(DatabaseGeneratedOption.Computed)]
    public new DateTime LoadedDateTime { get; init; }
}