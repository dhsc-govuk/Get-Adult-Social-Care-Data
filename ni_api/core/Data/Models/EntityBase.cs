using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace core.Data.Models;

public class EntityBase
{
    [Key, Column("id")]
    public int Id { get; set; }
}