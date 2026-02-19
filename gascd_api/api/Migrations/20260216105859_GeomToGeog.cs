using Microsoft.EntityFrameworkCore.Migrations;
using NetTopologySuite.Geometries;

#nullable disable

namespace api.Migrations
{
    /// <inheritdoc />
    public partial class GeomToGeog : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AlterColumn<Point>(
                name: "coordinate",
                table: "geo_data",
                type: "geography (point)",
                nullable: false,
                oldClrType: typeof(Point),
                oldType: "geometry (point)");

            migrationBuilder.AlterColumn<Polygon>(
                name: "bounding_polygon",
                table: "geo_data",
                type: "geography (polygon)",
                nullable: true,
                oldClrType: typeof(Polygon),
                oldType: "geometry (polygon)",
                oldNullable: true);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AlterColumn<Point>(
                name: "coordinate",
                table: "geo_data",
                type: "geometry (point)",
                nullable: false,
                oldClrType: typeof(Point),
                oldType: "geography (point)");

            migrationBuilder.AlterColumn<Polygon>(
                name: "bounding_polygon",
                table: "geo_data",
                type: "geometry (polygon)",
                nullable: true,
                oldClrType: typeof(Polygon),
                oldType: "geography (polygon)",
                oldNullable: true);
        }
    }
}