using Microsoft.EntityFrameworkCore;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace api.Data.Models;

[Table("postcodes")]
public partial class Postcode : EntityBase
{
    [Column("display_postcode"), StringLength(8)]
    public string DisplayPostcode { get; init; } = null!;

    [Column("latitude")]
    public decimal? Latitude { get; init; }

    [Column("longitude")]
    public decimal? Longitude { get; init; }

    [Column("local_authority_fk")]
    public string? LocalAuthorityFk { get; init; }

    [ForeignKey("LocalAuthorityFk")]
    public virtual LocalAuthority? LocalAuthority { get; init; }
}