using System.ComponentModel.DataAnnotations.Schema;

namespace api.Data.Models;

[Table("care_providers")]
public class CareProvider
{
    [Column("id")]
    public string? Id { get; init; }
    [Column("name")]
    public string? Name { get; init; }
    [Column("loaded_datetime")]
    [DatabaseGenerated(DatabaseGeneratedOption.Computed)]
    public DateTime LoadedDateTime { get; init; }
}