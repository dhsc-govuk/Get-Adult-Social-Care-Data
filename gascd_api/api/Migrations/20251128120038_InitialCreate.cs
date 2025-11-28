using Microsoft.EntityFrameworkCore.Migrations;
using System;

#nullable disable

namespace api.Migrations
{
    /// <inheritdoc />
    public partial class InitialCreate : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.CreateTable(
                name: "care_providers",
                columns: table => new
                {
                    id = table.Column<string>(type: "text", nullable: false),
                    name = table.Column<string>(type: "text", nullable: false),
                    loaded_datetime = table.Column<DateTime>(type: "timestamp with time zone", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_care_providers", x => x.id);
                });

            migrationBuilder.CreateTable(
                name: "postcodes",
                columns: table => new
                {
                    sanitised_postcode = table.Column<string>(type: "text", nullable: false),
                    display_postcode = table.Column<string>(type: "text", nullable: false),
                    latitude = table.Column<decimal>(type: "numeric", nullable: true),
                    longitude = table.Column<decimal>(type: "numeric", nullable: true),
                    la_code = table.Column<string>(type: "text", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_postcodes", x => x.sanitised_postcode);
                });
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "care_providers");

            migrationBuilder.DropTable(
                name: "postcodes");
        }
    }
}