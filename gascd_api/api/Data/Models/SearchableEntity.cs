using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace api.Data.Models;

public class SearchableEntity : EntityBase
{
    [Column("code"), StringLength(15)]
    public string Code { get; init; } = null!;
}