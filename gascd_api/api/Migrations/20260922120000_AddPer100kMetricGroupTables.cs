using Microsoft.EntityFrameworkCore.Migrations;
using Npgsql.EntityFrameworkCore.PostgreSQL.Metadata;
using System;

#nullable disable

namespace api.Migrations
{
    /// <summary>
    /// Six value tables for the September-release metric groups: care home beds per 100,000 under the
    /// 18-64 and 65+ population denominators (GASCD-99/241) and the per-100,000-adults twins of the
    /// primary support reason, expenditure and community care count metrics (GASCD-152).
    /// Same shape as every other MetricTimeSeries table.
    /// </summary>
    public partial class AddPer100kMetricGroupTables : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.CreateTable(
                name: "bedcount_per_hundred_thousand_18_64",
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
                    table.PrimaryKey("PK_bedcount_per_hundred_thousand_18_64", x => x.id);
                    table.ForeignKey(
                        name: "FK_bedcount_per_hundred_thousand_18_64_metrics_metric_fk",
                        column: x => x.metric_fk,
                        principalTable: "metrics",
                        principalColumn: "id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "bedcount_per_hundred_thousand_65over",
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
                    table.PrimaryKey("PK_bedcount_per_hundred_thousand_65over", x => x.id);
                    table.ForeignKey(
                        name: "FK_bedcount_per_hundred_thousand_65over_metrics_metric_fk",
                        column: x => x.metric_fk,
                        principalTable: "metrics",
                        principalColumn: "id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "num_clients_long_term_support_per100k_adults",
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
                    table.PrimaryKey("PK_num_clients_long_term_support_per100k_adults", x => x.id);
                    table.ForeignKey(
                        name: "FK_num_clients_long_term_support_per100k_adults_metrics_metric~",
                        column: x => x.metric_fk,
                        principalTable: "metrics",
                        principalColumn: "id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "expenditure_duration_psr_per100k_adults",
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
                    table.PrimaryKey("PK_expenditure_duration_psr_per100k_adults", x => x.id);
                    table.ForeignKey(
                        name: "FK_expenditure_duration_psr_per100k_adults_metrics_metric_fk",
                        column: x => x.metric_fk,
                        principalTable: "metrics",
                        principalColumn: "id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "expenditure_longterm_support_setting_per100k_adults",
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
                    table.PrimaryKey("PK_expenditure_longterm_support_setting_per100k_adults", x => x.id);
                    table.ForeignKey(
                        name: "FK_expenditure_longterm_support_setting_per100k_adults_metrics~",
                        column: x => x.metric_fk,
                        principalTable: "metrics",
                        principalColumn: "id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "num_clients_comm_care_per100k_adults",
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
                    table.PrimaryKey("PK_num_clients_comm_care_per100k_adults", x => x.id);
                    table.ForeignKey(
                        name: "FK_num_clients_comm_care_per100k_adults_metrics_metric_fk",
                        column: x => x.metric_fk,
                        principalTable: "metrics",
                        principalColumn: "id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateIndex(
                name: "IX_bedcount_per_hundred_thousand_18_64_location_code_location_~",
                table: "bedcount_per_hundred_thousand_18_64",
                columns: new[] { "location_code", "location_type" });

            migrationBuilder.CreateIndex(
                name: "IX_bedcount_per_hundred_thousand_18_64_metric_fk",
                table: "bedcount_per_hundred_thousand_18_64",
                column: "metric_fk");

            migrationBuilder.CreateIndex(
                name: "IX_bedcount_per_hundred_thousand_65over_location_code_location~",
                table: "bedcount_per_hundred_thousand_65over",
                columns: new[] { "location_code", "location_type" });

            migrationBuilder.CreateIndex(
                name: "IX_bedcount_per_hundred_thousand_65over_metric_fk",
                table: "bedcount_per_hundred_thousand_65over",
                column: "metric_fk");

            migrationBuilder.CreateIndex(
                name: "IX_num_clients_long_term_support_per100k_adults_location_code_~",
                table: "num_clients_long_term_support_per100k_adults",
                columns: new[] { "location_code", "location_type" });

            migrationBuilder.CreateIndex(
                name: "IX_num_clients_long_term_support_per100k_adults_metric_fk",
                table: "num_clients_long_term_support_per100k_adults",
                column: "metric_fk");

            migrationBuilder.CreateIndex(
                name: "IX_expenditure_duration_psr_per100k_adults_location_code_locat~",
                table: "expenditure_duration_psr_per100k_adults",
                columns: new[] { "location_code", "location_type" });

            migrationBuilder.CreateIndex(
                name: "IX_expenditure_duration_psr_per100k_adults_metric_fk",
                table: "expenditure_duration_psr_per100k_adults",
                column: "metric_fk");

            migrationBuilder.CreateIndex(
                name: "IX_expenditure_longterm_support_setting_per100k_adults_locatio~",
                table: "expenditure_longterm_support_setting_per100k_adults",
                columns: new[] { "location_code", "location_type" });

            migrationBuilder.CreateIndex(
                name: "IX_expenditure_longterm_support_setting_per100k_adults_metric_~",
                table: "expenditure_longterm_support_setting_per100k_adults",
                column: "metric_fk");

            migrationBuilder.CreateIndex(
                name: "IX_num_clients_comm_care_per100k_adults_location_code_location~",
                table: "num_clients_comm_care_per100k_adults",
                columns: new[] { "location_code", "location_type" });

            migrationBuilder.CreateIndex(
                name: "IX_num_clients_comm_care_per100k_adults_metric_fk",
                table: "num_clients_comm_care_per100k_adults",
                column: "metric_fk");

        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(name: "bedcount_per_hundred_thousand_18_64");

            migrationBuilder.DropTable(name: "bedcount_per_hundred_thousand_65over");

            migrationBuilder.DropTable(name: "num_clients_long_term_support_per100k_adults");

            migrationBuilder.DropTable(name: "expenditure_duration_psr_per100k_adults");

            migrationBuilder.DropTable(name: "expenditure_longterm_support_setting_per100k_adults");

            migrationBuilder.DropTable(name: "num_clients_comm_care_per100k_adults");

        }
    }
}
