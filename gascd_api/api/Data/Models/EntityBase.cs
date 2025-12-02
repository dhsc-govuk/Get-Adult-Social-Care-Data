using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace api.Data.Models;

public class EntityBase
{
    [Column("id"), StringLength(15)]
    public string Id { get; init; } = null!;

    [Column("loaded_datetime"), DatabaseGenerated(DatabaseGeneratedOption.Computed)]
    public DateTime LoadedDateTime { get; init; }
}