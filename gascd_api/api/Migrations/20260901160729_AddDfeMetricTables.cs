using System;
using Microsoft.EntityFrameworkCore.Migrations;
using Npgsql.EntityFrameworkCore.PostgreSQL.Metadata;

#nullable disable

namespace api.Migrations
{
    /// <inheritdoc />
    public partial class AddDfeMetricTables : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.CreateTable(
                name: "cin_per_10000_children",
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
                    table.PrimaryKey("PK_cin_per_10000_children", x => x.id);
                    table.ForeignKey(
                        name: "FK_cin_per_10000_children_metrics_metric_fk",
                        column: x => x.metric_fk,
                        principalTable: "metrics",
                        principalColumn: "id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "num_children_in_need",
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
                    table.PrimaryKey("PK_num_children_in_need", x => x.id);
                    table.ForeignKey(
                        name: "FK_num_children_in_need_metrics_metric_fk",
                        column: x => x.metric_fk,
                        principalTable: "metrics",
                        principalColumn: "id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "num_cin_transfer_asc",
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
                    table.PrimaryKey("PK_num_cin_transfer_asc", x => x.id);
                    table.ForeignKey(
                        name: "FK_num_cin_transfer_asc_metrics_metric_fk",
                        column: x => x.metric_fk,
                        principalTable: "metrics",
                        principalColumn: "id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "num_ehcp_14plus",
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
                    table.PrimaryKey("PK_num_ehcp_14plus", x => x.id);
                    table.ForeignKey(
                        name: "FK_num_ehcp_14plus_metrics_metric_fk",
                        column: x => x.metric_fk,
                        principalTable: "metrics",
                        principalColumn: "id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "num_sen_support_14plus",
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
                    table.PrimaryKey("PK_num_sen_support_14plus", x => x.id);
                    table.ForeignKey(
                        name: "FK_num_sen_support_14plus_metrics_metric_fk",
                        column: x => x.metric_fk,
                        principalTable: "metrics",
                        principalColumn: "id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "perc_sen_support_14plus",
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
                    table.PrimaryKey("PK_perc_sen_support_14plus", x => x.id);
                    table.ForeignKey(
                        name: "FK_perc_sen_support_14plus_metrics_metric_fk",
                        column: x => x.metric_fk,
                        principalTable: "metrics",
                        principalColumn: "id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateIndex(
                name: "IX_cin_per_10000_children_location_code_location_type",
                table: "cin_per_10000_children",
                columns: new[] { "location_code", "location_type" });

            migrationBuilder.CreateIndex(
                name: "IX_cin_per_10000_children_metric_fk",
                table: "cin_per_10000_children",
                column: "metric_fk");

            migrationBuilder.CreateIndex(
                name: "IX_num_children_in_need_location_code_location_type",
                table: "num_children_in_need",
                columns: new[] { "location_code", "location_type" });

            migrationBuilder.CreateIndex(
                name: "IX_num_children_in_need_metric_fk",
                table: "num_children_in_need",
                column: "metric_fk");

            migrationBuilder.CreateIndex(
                name: "IX_num_cin_transfer_asc_location_code_location_type",
                table: "num_cin_transfer_asc",
                columns: new[] { "location_code", "location_type" });

            migrationBuilder.CreateIndex(
                name: "IX_num_cin_transfer_asc_metric_fk",
                table: "num_cin_transfer_asc",
                column: "metric_fk");

            migrationBuilder.CreateIndex(
                name: "IX_num_ehcp_14plus_location_code_location_type",
                table: "num_ehcp_14plus",
                columns: new[] { "location_code", "location_type" });

            migrationBuilder.CreateIndex(
                name: "IX_num_ehcp_14plus_metric_fk",
                table: "num_ehcp_14plus",
                column: "metric_fk");

            migrationBuilder.CreateIndex(
                name: "IX_num_sen_support_14plus_location_code_location_type",
                table: "num_sen_support_14plus",
                columns: new[] { "location_code", "location_type" });

            migrationBuilder.CreateIndex(
                name: "IX_num_sen_support_14plus_metric_fk",
                table: "num_sen_support_14plus",
                column: "metric_fk");

            migrationBuilder.CreateIndex(
                name: "IX_perc_sen_support_14plus_location_code_location_type",
                table: "perc_sen_support_14plus",
                columns: new[] { "location_code", "location_type" });

            migrationBuilder.CreateIndex(
                name: "IX_perc_sen_support_14plus_metric_fk",
                table: "perc_sen_support_14plus",
                column: "metric_fk");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "cin_per_10000_children");

            migrationBuilder.DropTable(
                name: "num_children_in_need");

            migrationBuilder.DropTable(
                name: "num_cin_transfer_asc");

            migrationBuilder.DropTable(
                name: "num_ehcp_14plus");

            migrationBuilder.DropTable(
                name: "num_sen_support_14plus");

            migrationBuilder.DropTable(
                name: "perc_sen_support_14plus");
        }
    }
}
