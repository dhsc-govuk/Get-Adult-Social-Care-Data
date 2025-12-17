using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace api.Data.Models;

public class EntityBase
{
    [Key, Column("id")]
    public int Id { get; set; }

    [Column("code"), StringLength(15)]
    public string Code { get; init; } = null!;

    [Column("loaded_datetime"), DatabaseGenerated(DatabaseGeneratedOption.Computed)]
    public DateTime LoadedDateTime { get; init; }
}