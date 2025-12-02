using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace api.Data.Models;

[Table("care_providers")]
public class CareProvider
{
    [Column("id"), StringLength(15)]
    public string? Id { get; init; }

    [Column("name"), StringLength(100)]
    public string? Name { get; init; }

    [Column("loaded_datetime"), DatabaseGenerated(DatabaseGeneratedOption.Computed)]
    public DateTime LoadedDateTime { get; init; }
}