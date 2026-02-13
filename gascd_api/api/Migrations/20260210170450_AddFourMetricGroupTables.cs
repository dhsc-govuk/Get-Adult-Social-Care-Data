using Microsoft.EntityFrameworkCore.Migrations;
using Npgsql.EntityFrameworkCore.PostgreSQL.Metadata;
using System;

#nullable disable

namespace api.Migrations
{
    /// <inheritdoc />
    public partial class AddFourMetricGroupTables : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.CreateTable(
                name: "expenditure_duration_psr",
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
                    table.PrimaryKey("PK_expenditure_duration_psr", x => x.id);
                    table.ForeignKey(
                        name: "FK_expenditure_duration_psr_metrics_metric_fk",
                        column: x => x.metric_fk,
                        principalTable: "metrics",
                        principalColumn: "id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "expenditure_longterm_support_setting",
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
                    table.PrimaryKey("PK_expenditure_longterm_support_setting", x => x.id);
                    table.ForeignKey(
                        name: "FK_expenditure_longterm_support_setting_metrics_metric_fk",
                        column: x => x.metric_fk,
                        principalTable: "metrics",
                        principalColumn: "id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "num_clients_comm_care",
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
                    table.PrimaryKey("PK_num_clients_comm_care", x => x.id);
                    table.ForeignKey(
                        name: "FK_num_clients_comm_care_metrics_metric_fk",
                        column: x => x.metric_fk,
                        principalTable: "metrics",
                        principalColumn: "id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "num_provider_locations",
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
                    table.PrimaryKey("PK_num_provider_locations", x => x.id);
                    table.ForeignKey(
                        name: "FK_num_provider_locations_metrics_metric_fk",
                        column: x => x.metric_fk,
                        principalTable: "metrics",
                        principalColumn: "id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateIndex(
                name: "IX_expenditure_duration_psr_location_code_location_type",
                table: "expenditure_duration_psr",
                columns: new[] { "location_code", "location_type" });

            migrationBuilder.CreateIndex(
                name: "IX_expenditure_duration_psr_metric_fk",
                table: "expenditure_duration_psr",
                column: "metric_fk");

            migrationBuilder.CreateIndex(
                name: "IX_expenditure_longterm_support_setting_location_code_location~",
                table: "expenditure_longterm_support_setting",
                columns: new[] { "location_code", "location_type" });

            migrationBuilder.CreateIndex(
                name: "IX_expenditure_longterm_support_setting_metric_fk",
                table: "expenditure_longterm_support_setting",
                column: "metric_fk");

            migrationBuilder.CreateIndex(
                name: "IX_num_clients_comm_care_location_code_location_type",
                table: "num_clients_comm_care",
                columns: new[] { "location_code", "location_type" });

            migrationBuilder.CreateIndex(
                name: "IX_num_clients_comm_care_metric_fk",
                table: "num_clients_comm_care",
                column: "metric_fk");

            migrationBuilder.CreateIndex(
                name: "IX_num_provider_locations_location_code_location_type",
                table: "num_provider_locations",
                columns: new[] { "location_code", "location_type" });

            migrationBuilder.CreateIndex(
                name: "IX_num_provider_locations_metric_fk",
                table: "num_provider_locations",
                column: "metric_fk");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "expenditure_duration_psr");

            migrationBuilder.DropTable(
                name: "expenditure_longterm_support_setting");

            migrationBuilder.DropTable(
                name: "num_clients_comm_care");

            migrationBuilder.DropTable(
                name: "num_provider_locations");
        }
    }
}