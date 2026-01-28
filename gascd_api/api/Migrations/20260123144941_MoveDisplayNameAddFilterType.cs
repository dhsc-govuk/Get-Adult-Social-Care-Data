using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace api.Migrations
{
    /// <inheritdoc />
    public partial class MoveDisplayNameAddFilterType : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.RenameColumn(
                name: "display_name",
                table: "metrics",
                newName: "filter_type");

            migrationBuilder.AddColumn<string>(
                name: "display_name",
                table: "metric_groups",
                type: "character varying(255)",
                maxLength: 255,
                nullable: false,
                defaultValue: "");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "display_name",
                table: "metric_groups");

            migrationBuilder.RenameColumn(
                name: "filter_type",
                table: "metrics",
                newName: "display_name");
        }
    }
}