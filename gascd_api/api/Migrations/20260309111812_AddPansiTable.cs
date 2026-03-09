using Microsoft.EntityFrameworkCore.Migrations;
using Npgsql.EntityFrameworkCore.PostgreSQL.Metadata;
using System;

#nullable disable

namespace api.Migrations
{
    /// <inheritdoc />
    public partial class AddPansiTable : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.CreateTable(
                name: "pansi",
                columns: table => new
                {
                    id = table.Column<int>(type: "integer", nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
                    loaded_datetime = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    start_date = table.Column<DateOnly>(type: "date", nullable: false),
                    end_date = table.Column<DateOnly>(type: "date", nullable: false),
                    location_code = table.Column<string>(type: "character varying(15)", maxLength: 15, nullable: false),
                    location_type = table.Column<string>(type: "character varying(25)", maxLength: 25, nullable: false),
                    metric_fk = table.Column<int>(type: "integer", nullable: false),
                    time_series = table.Column<decimal?[]>(type: "numeric[]", nullable: false),
                    latest_value = table.Column<decimal>(type: "numeric", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_pansi", x => x.id);
                    table.ForeignKey(
                        name: "FK_pansi_metrics_metric_fk",
                        column: x => x.metric_fk,
                        principalTable: "metrics",
                        principalColumn: "id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateIndex(
                name: "IX_pansi_location_code_location_type",
                table: "pansi",
                columns: new[] { "location_code", "location_type" });

            migrationBuilder.CreateIndex(
                name: "IX_pansi_metric_fk",
                table: "pansi",
                column: "metric_fk");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "pansi");
        }
    }
}