using System;
using System.Collections.Generic;
using Microsoft.EntityFrameworkCore.Migrations;
using Npgsql.EntityFrameworkCore.PostgreSQL.Metadata;

#nullable disable

namespace api.Migrations
{
    /// <inheritdoc />
    public partial class AddCqcLocationRatings : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.CreateTable(
                name: "cqc_location_ratings",
                columns: table => new
                {
                    id = table.Column<int>(type: "integer", nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
                    location_code = table.Column<string>(type: "character varying(15)", maxLength: 15, nullable: false),
                    location_name = table.Column<string>(type: "character varying(255)", maxLength: 255, nullable: false),
                    provider_code = table.Column<string>(type: "character varying(15)", maxLength: 15, nullable: false),
                    provider_name = table.Column<string>(type: "character varying(255)", maxLength: 255, nullable: false),
                    local_authority_fk = table.Column<int>(type: "integer", nullable: false),
                    service_types = table.Column<List<string>>(type: "text[]", nullable: false),
                    overall_rating = table.Column<string>(type: "character varying(25)", maxLength: 25, nullable: true),
                    rating_published = table.Column<DateOnly>(type: "date", nullable: true),
                    data_month = table.Column<DateOnly>(type: "date", nullable: false),
                    loaded_datetime = table.Column<DateTime>(type: "timestamp with time zone", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_cqc_location_ratings", x => x.id);
                    table.ForeignKey(
                        name: "FK_cqc_location_ratings_local_authorities_local_authority_fk",
                        column: x => x.local_authority_fk,
                        principalTable: "local_authorities",
                        principalColumn: "id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateIndex(
                name: "IX_cqc_location_ratings_local_authority_fk",
                table: "cqc_location_ratings",
                column: "local_authority_fk");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "cqc_location_ratings");
        }
    }
}