using NetTopologySuite.Geometries;
using System.ComponentModel.DataAnnotations.Schema;

namespace api.Data.Models.Reference;

[Table("geo_data")]
public class GeoData : EntityBase
{
    [Column("coordinate", TypeName = "geometry (point)")]
    public required Point Coordinate { get; init; }

    [Column("bounding_polygon", TypeName = "geometry (polygon)")]
    public Polygon? BoundingPolygon { get; init; }
}