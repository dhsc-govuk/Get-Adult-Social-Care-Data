using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace api.Data.Models;

[Table("countries")]
public class Country
{
    [Key]
    [Column("id")]
    public string? Id { get; init; }
    [Column("name")]
    public string? Name { get; init; }
    [Column("loaded_datetime"), DatabaseGenerated(DatabaseGeneratedOption.Computed)]
    public DateTime LoadedDateTime { get; init; }
}