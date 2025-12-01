using Microsoft.EntityFrameworkCore;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace api.Data.Models;

[Table("postcodes")]
public partial class Postcode
{
    [Key]
    [Column("sanitised_postcode")]
    [StringLength(7)]
    public string SanitisedPostcode { get; init; } = null!;

    [Column("display_postcode")]
    [StringLength(8)]
    public string DisplayPostcode { get; init; } = null!;

    [Column("latitude")]
    public decimal? Latitude { get; init; }

    [Column("longitude")]
    public decimal? Longitude { get; init; }

    [Column("la_code")]
    [StringLength(9)]
    public string? LaCode { get; init; }
}