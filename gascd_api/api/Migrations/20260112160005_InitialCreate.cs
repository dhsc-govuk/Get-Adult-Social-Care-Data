using Microsoft.EntityFrameworkCore.Migrations;
using NetTopologySuite.Geometries;
using Npgsql.EntityFrameworkCore.PostgreSQL.Metadata;
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
            migrationBuilder.AlterDatabase()
                .Annotation("Npgsql:PostgresExtension:postgis", ",,");

            migrationBuilder.CreateTable(
                name: "care_providers",
                columns: table => new
                {
                    id = table.Column<int>(type: "integer", nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
                    name = table.Column<string>(type: "character varying(100)", maxLength: 100, nullable: false),
                    loaded_datetime = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    code = table.Column<string>(type: "character varying(15)", maxLength: 15, nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_care_providers", x => x.id);
                });

            migrationBuilder.CreateTable(
                name: "geo_data",
                columns: table => new
                {
                    id = table.Column<int>(type: "integer", nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
                    coordinate = table.Column<Point>(type: "geometry (point)", nullable: false),
                    bounding_polygon = table.Column<Polygon>(type: "geometry (polygon)", nullable: true),
                    loaded_datetime = table.Column<DateTime>(type: "timestamp with time zone", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_geo_data", x => x.id);
                });

            migrationBuilder.CreateTable(
                name: "metric_groups",
                columns: table => new
                {
                    id = table.Column<int>(type: "integer", nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
                    code = table.Column<string>(type: "character varying(100)", maxLength: 100, nullable: false),
                    loaded_datetime = table.Column<DateTime>(type: "timestamp with time zone", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_metric_groups", x => x.id);
                });

            migrationBuilder.CreateTable(
                name: "countries",
                columns: table => new
                {
                    id = table.Column<int>(type: "integer", nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
                    name = table.Column<string>(type: "character varying(60)", maxLength: 60, nullable: false),
                    geo_data_fk = table.Column<int>(type: "integer", nullable: true),
                    loaded_datetime = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    code = table.Column<string>(type: "character varying(15)", maxLength: 15, nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_countries", x => x.id);
                    table.ForeignKey(
                        name: "FK_countries_geo_data_geo_data_fk",
                        column: x => x.geo_data_fk,
                        principalTable: "geo_data",
                        principalColumn: "id");
                });

            migrationBuilder.CreateTable(
                name: "metrics",
                columns: table => new
                {
                    id = table.Column<int>(type: "integer", nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
                    code = table.Column<string>(type: "character varying(100)", maxLength: 100, nullable: false),
                    metric_group_fk = table.Column<int>(type: "integer", nullable: false),
                    display_name = table.Column<string>(type: "character varying(255)", maxLength: 255, nullable: false),
                    numerator_description = table.Column<string>(type: "character varying(255)", maxLength: 255, nullable: false),
                    denominator_description = table.Column<string>(type: "character varying(255)", maxLength: 255, nullable: false),
                    data_source = table.Column<string>(type: "character varying(40)", maxLength: 40, nullable: false),
                    data_type = table.Column<string>(type: "character varying(50)", maxLength: 50, nullable: false),
                    frequency = table.Column<string>(type: "character varying(25)", maxLength: 25, nullable: false),
                    loaded_datetime = table.Column<DateTime>(type: "timestamp with time zone", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_metrics", x => x.id);
                    table.ForeignKey(
                        name: "FK_metrics_metric_groups_metric_group_fk",
                        column: x => x.metric_group_fk,
                        principalTable: "metric_groups",
                        principalColumn: "id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "regions",
                columns: table => new
                {
                    id = table.Column<int>(type: "integer", nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
                    name = table.Column<string>(type: "character varying(50)", maxLength: 50, nullable: false),
                    country_fk = table.Column<int>(type: "integer", nullable: false),
                    geo_data_fk = table.Column<int>(type: "integer", nullable: true),
                    loaded_datetime = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    code = table.Column<string>(type: "character varying(15)", maxLength: 15, nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_regions", x => x.id);
                    table.ForeignKey(
                        name: "FK_regions_countries_country_fk",
                        column: x => x.country_fk,
                        principalTable: "countries",
                        principalColumn: "id",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "FK_regions_geo_data_geo_data_fk",
                        column: x => x.geo_data_fk,
                        principalTable: "geo_data",
                        principalColumn: "id");
                });

            migrationBuilder.CreateTable(
                name: "bedcount",
                columns: table => new
                {
                    id = table.Column<int>(type: "integer", nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
                    loaded_datetime = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    start_date = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    end_date = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    location_code = table.Column<string>(type: "character varying(15)", maxLength: 15, nullable: false),
                    location_type = table.Column<string>(type: "character varying(25)", maxLength: 25, nullable: false),
                    metric_fk = table.Column<int>(type: "integer", nullable: false),
                    time_series = table.Column<decimal[]>(type: "numeric[]", nullable: false),
                    latest_value = table.Column<decimal>(type: "numeric", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_bedcount", x => x.id);
                    table.ForeignKey(
                        name: "FK_bedcount_metrics_metric_fk",
                        column: x => x.metric_fk,
                        principalTable: "metrics",
                        principalColumn: "id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "bedcount_per_hundred_thousand_adults",
                columns: table => new
                {
                    id = table.Column<int>(type: "integer", nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
                    loaded_datetime = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    start_date = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    end_date = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    location_code = table.Column<string>(type: "character varying(15)", maxLength: 15, nullable: false),
                    location_type = table.Column<string>(type: "character varying(25)", maxLength: 25, nullable: false),
                    metric_fk = table.Column<int>(type: "integer", nullable: false),
                    time_series = table.Column<decimal[]>(type: "numeric[]", nullable: false),
                    latest_value = table.Column<decimal>(type: "numeric", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_bedcount_per_hundred_thousand_adults", x => x.id);
                    table.ForeignKey(
                        name: "FK_bedcount_per_hundred_thousand_adults_metrics_metric_fk",
                        column: x => x.metric_fk,
                        principalTable: "metrics",
                        principalColumn: "id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "dementia_estimated_diagnosis_rate_65over",
                columns: table => new
                {
                    id = table.Column<int>(type: "integer", nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
                    loaded_datetime = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    start_date = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    end_date = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    location_code = table.Column<string>(type: "character varying(15)", maxLength: 15, nullable: false),
                    location_type = table.Column<string>(type: "character varying(25)", maxLength: 25, nullable: false),
                    metric_fk = table.Column<int>(type: "integer", nullable: false),
                    time_series = table.Column<decimal[]>(type: "numeric[]", nullable: false),
                    latest_value = table.Column<decimal>(type: "numeric", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_dementia_estimated_diagnosis_rate_65over", x => x.id);
                    table.ForeignKey(
                        name: "FK_dementia_estimated_diagnosis_rate_65over_metrics_metric_fk",
                        column: x => x.metric_fk,
                        principalTable: "metrics",
                        principalColumn: "id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "dementia_prevalence_65over",
                columns: table => new
                {
                    id = table.Column<int>(type: "integer", nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
                    loaded_datetime = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    start_date = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    end_date = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    location_code = table.Column<string>(type: "character varying(15)", maxLength: 15, nullable: false),
                    location_type = table.Column<string>(type: "character varying(25)", maxLength: 25, nullable: false),
                    metric_fk = table.Column<int>(type: "integer", nullable: false),
                    time_series = table.Column<decimal[]>(type: "numeric[]", nullable: false),
                    latest_value = table.Column<decimal>(type: "numeric", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_dementia_prevalence_65over", x => x.id);
                    table.ForeignKey(
                        name: "FK_dementia_prevalence_65over_metrics_metric_fk",
                        column: x => x.metric_fk,
                        principalTable: "metrics",
                        principalColumn: "id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "dementia_qof_prevalence",
                columns: table => new
                {
                    id = table.Column<int>(type: "integer", nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
                    loaded_datetime = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    start_date = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    end_date = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    location_code = table.Column<string>(type: "character varying(15)", maxLength: 15, nullable: false),
                    location_type = table.Column<string>(type: "character varying(25)", maxLength: 25, nullable: false),
                    metric_fk = table.Column<int>(type: "integer", nullable: false),
                    time_series = table.Column<decimal[]>(type: "numeric[]", nullable: false),
                    latest_value = table.Column<decimal>(type: "numeric", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_dementia_qof_prevalence", x => x.id);
                    table.ForeignKey(
                        name: "FK_dementia_qof_prevalence_metrics_metric_fk",
                        column: x => x.metric_fk,
                        principalTable: "metrics",
                        principalColumn: "id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "dementia_register_65over_per100k",
                columns: table => new
                {
                    id = table.Column<int>(type: "integer", nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
                    loaded_datetime = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    start_date = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    end_date = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    location_code = table.Column<string>(type: "character varying(15)", maxLength: 15, nullable: false),
                    location_type = table.Column<string>(type: "character varying(25)", maxLength: 25, nullable: false),
                    metric_fk = table.Column<int>(type: "integer", nullable: false),
                    time_series = table.Column<decimal[]>(type: "numeric[]", nullable: false),
                    latest_value = table.Column<decimal>(type: "numeric", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_dementia_register_65over_per100k", x => x.id);
                    table.ForeignKey(
                        name: "FK_dementia_register_65over_per100k_metrics_metric_fk",
                        column: x => x.metric_fk,
                        principalTable: "metrics",
                        principalColumn: "id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "learning_disability_prevalence",
                columns: table => new
                {
                    id = table.Column<int>(type: "integer", nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
                    loaded_datetime = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    start_date = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    end_date = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    location_code = table.Column<string>(type: "character varying(15)", maxLength: 15, nullable: false),
                    location_type = table.Column<string>(type: "character varying(25)", maxLength: 25, nullable: false),
                    metric_fk = table.Column<int>(type: "integer", nullable: false),
                    time_series = table.Column<decimal[]>(type: "numeric[]", nullable: false),
                    latest_value = table.Column<decimal>(type: "numeric", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_learning_disability_prevalence", x => x.id);
                    table.ForeignKey(
                        name: "FK_learning_disability_prevalence_metrics_metric_fk",
                        column: x => x.metric_fk,
                        principalTable: "metrics",
                        principalColumn: "id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "median_bed_count",
                columns: table => new
                {
                    id = table.Column<int>(type: "integer", nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
                    loaded_datetime = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    start_date = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    end_date = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    location_code = table.Column<string>(type: "character varying(15)", maxLength: 15, nullable: false),
                    location_type = table.Column<string>(type: "character varying(25)", maxLength: 25, nullable: false),
                    metric_fk = table.Column<int>(type: "integer", nullable: false),
                    time_series = table.Column<decimal[]>(type: "numeric[]", nullable: false),
                    latest_value = table.Column<decimal>(type: "numeric", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_median_bed_count", x => x.id);
                    table.ForeignKey(
                        name: "FK_median_bed_count_metrics_metric_fk",
                        column: x => x.metric_fk,
                        principalTable: "metrics",
                        principalColumn: "id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "median_occupancy",
                columns: table => new
                {
                    id = table.Column<int>(type: "integer", nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
                    loaded_datetime = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    start_date = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    end_date = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    location_code = table.Column<string>(type: "character varying(15)", maxLength: 15, nullable: false),
                    location_type = table.Column<string>(type: "character varying(25)", maxLength: 25, nullable: false),
                    metric_fk = table.Column<int>(type: "integer", nullable: false),
                    time_series = table.Column<decimal[]>(type: "numeric[]", nullable: false),
                    latest_value = table.Column<decimal>(type: "numeric", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_median_occupancy", x => x.id);
                    table.ForeignKey(
                        name: "FK_median_occupancy_metrics_metric_fk",
                        column: x => x.metric_fk,
                        principalTable: "metrics",
                        principalColumn: "id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "occupancy_rates",
                columns: table => new
                {
                    id = table.Column<int>(type: "integer", nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
                    loaded_datetime = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    start_date = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    end_date = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    location_code = table.Column<string>(type: "character varying(15)", maxLength: 15, nullable: false),
                    location_type = table.Column<string>(type: "character varying(25)", maxLength: 25, nullable: false),
                    metric_fk = table.Column<int>(type: "integer", nullable: false),
                    time_series = table.Column<decimal[]>(type: "numeric[]", nullable: false),
                    latest_value = table.Column<decimal>(type: "numeric", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_occupancy_rates", x => x.id);
                    table.ForeignKey(
                        name: "FK_occupancy_rates_metrics_metric_fk",
                        column: x => x.metric_fk,
                        principalTable: "metrics",
                        principalColumn: "id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "perc_18_64",
                columns: table => new
                {
                    id = table.Column<int>(type: "integer", nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
                    loaded_datetime = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    start_date = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    end_date = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    location_code = table.Column<string>(type: "character varying(15)", maxLength: 15, nullable: false),
                    location_type = table.Column<string>(type: "character varying(25)", maxLength: 25, nullable: false),
                    metric_fk = table.Column<int>(type: "integer", nullable: false),
                    time_series = table.Column<decimal[]>(type: "numeric[]", nullable: false),
                    latest_value = table.Column<decimal>(type: "numeric", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_perc_18_64", x => x.id);
                    table.ForeignKey(
                        name: "FK_perc_18_64_metrics_metric_fk",
                        column: x => x.metric_fk,
                        principalTable: "metrics",
                        principalColumn: "id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "perc_65over",
                columns: table => new
                {
                    id = table.Column<int>(type: "integer", nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
                    loaded_datetime = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    start_date = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    end_date = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    location_code = table.Column<string>(type: "character varying(15)", maxLength: 15, nullable: false),
                    location_type = table.Column<string>(type: "character varying(25)", maxLength: 25, nullable: false),
                    metric_fk = table.Column<int>(type: "integer", nullable: false),
                    time_series = table.Column<decimal[]>(type: "numeric[]", nullable: false),
                    latest_value = table.Column<decimal>(type: "numeric", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_perc_65over", x => x.id);
                    table.ForeignKey(
                        name: "FK_perc_65over_metrics_metric_fk",
                        column: x => x.metric_fk,
                        principalTable: "metrics",
                        principalColumn: "id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "perc_75over",
                columns: table => new
                {
                    id = table.Column<int>(type: "integer", nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
                    loaded_datetime = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    start_date = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    end_date = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    location_code = table.Column<string>(type: "character varying(15)", maxLength: 15, nullable: false),
                    location_type = table.Column<string>(type: "character varying(25)", maxLength: 25, nullable: false),
                    metric_fk = table.Column<int>(type: "integer", nullable: false),
                    time_series = table.Column<decimal[]>(type: "numeric[]", nullable: false),
                    latest_value = table.Column<decimal>(type: "numeric", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_perc_75over", x => x.id);
                    table.ForeignKey(
                        name: "FK_perc_75over_metrics_metric_fk",
                        column: x => x.metric_fk,
                        principalTable: "metrics",
                        principalColumn: "id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "perc_85over",
                columns: table => new
                {
                    id = table.Column<int>(type: "integer", nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
                    loaded_datetime = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    start_date = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    end_date = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    location_code = table.Column<string>(type: "character varying(15)", maxLength: 15, nullable: false),
                    location_type = table.Column<string>(type: "character varying(25)", maxLength: 25, nullable: false),
                    metric_fk = table.Column<int>(type: "integer", nullable: false),
                    time_series = table.Column<decimal[]>(type: "numeric[]", nullable: false),
                    latest_value = table.Column<decimal>(type: "numeric", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_perc_85over", x => x.id);
                    table.ForeignKey(
                        name: "FK_perc_85over_metrics_metric_fk",
                        column: x => x.metric_fk,
                        principalTable: "metrics",
                        principalColumn: "id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "perc_general_health",
                columns: table => new
                {
                    id = table.Column<int>(type: "integer", nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
                    loaded_datetime = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    start_date = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    end_date = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    location_code = table.Column<string>(type: "character varying(15)", maxLength: 15, nullable: false),
                    location_type = table.Column<string>(type: "character varying(25)", maxLength: 25, nullable: false),
                    metric_fk = table.Column<int>(type: "integer", nullable: false),
                    time_series = table.Column<decimal[]>(type: "numeric[]", nullable: false),
                    latest_value = table.Column<decimal>(type: "numeric", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_perc_general_health", x => x.id);
                    table.ForeignKey(
                        name: "FK_perc_general_health_metrics_metric_fk",
                        column: x => x.metric_fk,
                        principalTable: "metrics",
                        principalColumn: "id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "perc_household_ownership",
                columns: table => new
                {
                    id = table.Column<int>(type: "integer", nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
                    loaded_datetime = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    start_date = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    end_date = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    location_code = table.Column<string>(type: "character varying(15)", maxLength: 15, nullable: false),
                    location_type = table.Column<string>(type: "character varying(25)", maxLength: 25, nullable: false),
                    metric_fk = table.Column<int>(type: "integer", nullable: false),
                    time_series = table.Column<decimal[]>(type: "numeric[]", nullable: false),
                    latest_value = table.Column<decimal>(type: "numeric", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_perc_household_ownership", x => x.id);
                    table.ForeignKey(
                        name: "FK_perc_household_ownership_metrics_metric_fk",
                        column: x => x.metric_fk,
                        principalTable: "metrics",
                        principalColumn: "id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "perc_households_deprivation_deprived",
                columns: table => new
                {
                    id = table.Column<int>(type: "integer", nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
                    loaded_datetime = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    start_date = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    end_date = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    location_code = table.Column<string>(type: "character varying(15)", maxLength: 15, nullable: false),
                    location_type = table.Column<string>(type: "character varying(25)", maxLength: 25, nullable: false),
                    metric_fk = table.Column<int>(type: "integer", nullable: false),
                    time_series = table.Column<decimal[]>(type: "numeric[]", nullable: false),
                    latest_value = table.Column<decimal>(type: "numeric", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_perc_households_deprivation_deprived", x => x.id);
                    table.ForeignKey(
                        name: "FK_perc_households_deprivation_deprived_metrics_metric_fk",
                        column: x => x.metric_fk,
                        principalTable: "metrics",
                        principalColumn: "id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "perc_households_one_person",
                columns: table => new
                {
                    id = table.Column<int>(type: "integer", nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
                    loaded_datetime = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    start_date = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    end_date = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    location_code = table.Column<string>(type: "character varying(15)", maxLength: 15, nullable: false),
                    location_type = table.Column<string>(type: "character varying(25)", maxLength: 25, nullable: false),
                    metric_fk = table.Column<int>(type: "integer", nullable: false),
                    time_series = table.Column<decimal[]>(type: "numeric[]", nullable: false),
                    latest_value = table.Column<decimal>(type: "numeric", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_perc_households_one_person", x => x.id);
                    table.ForeignKey(
                        name: "FK_perc_households_one_person_metrics_metric_fk",
                        column: x => x.metric_fk,
                        principalTable: "metrics",
                        principalColumn: "id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "perc_population_disability",
                columns: table => new
                {
                    id = table.Column<int>(type: "integer", nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
                    loaded_datetime = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    start_date = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    end_date = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    location_code = table.Column<string>(type: "character varying(15)", maxLength: 15, nullable: false),
                    location_type = table.Column<string>(type: "character varying(25)", maxLength: 25, nullable: false),
                    metric_fk = table.Column<int>(type: "integer", nullable: false),
                    time_series = table.Column<decimal[]>(type: "numeric[]", nullable: false),
                    latest_value = table.Column<decimal>(type: "numeric", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_perc_population_disability", x => x.id);
                    table.ForeignKey(
                        name: "FK_perc_population_disability_metrics_metric_fk",
                        column: x => x.metric_fk,
                        principalTable: "metrics",
                        principalColumn: "id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "perc_unpaid_care_provider",
                columns: table => new
                {
                    id = table.Column<int>(type: "integer", nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
                    loaded_datetime = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    start_date = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    end_date = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    location_code = table.Column<string>(type: "character varying(15)", maxLength: 15, nullable: false),
                    location_type = table.Column<string>(type: "character varying(25)", maxLength: 25, nullable: false),
                    metric_fk = table.Column<int>(type: "integer", nullable: false),
                    time_series = table.Column<decimal[]>(type: "numeric[]", nullable: false),
                    latest_value = table.Column<decimal>(type: "numeric", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_perc_unpaid_care_provider", x => x.id);
                    table.ForeignKey(
                        name: "FK_perc_unpaid_care_provider_metrics_metric_fk",
                        column: x => x.metric_fk,
                        principalTable: "metrics",
                        principalColumn: "id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "total_population",
                columns: table => new
                {
                    id = table.Column<int>(type: "integer", nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
                    loaded_datetime = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    start_date = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    end_date = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    location_code = table.Column<string>(type: "character varying(15)", maxLength: 15, nullable: false),
                    location_type = table.Column<string>(type: "character varying(25)", maxLength: 25, nullable: false),
                    metric_fk = table.Column<int>(type: "integer", nullable: false),
                    time_series = table.Column<decimal[]>(type: "numeric[]", nullable: false),
                    latest_value = table.Column<decimal>(type: "numeric", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_total_population", x => x.id);
                    table.ForeignKey(
                        name: "FK_total_population_metrics_metric_fk",
                        column: x => x.metric_fk,
                        principalTable: "metrics",
                        principalColumn: "id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "local_authorities",
                columns: table => new
                {
                    id = table.Column<int>(type: "integer", nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
                    name = table.Column<string>(type: "character varying(50)", maxLength: 50, nullable: false),
                    region_fk = table.Column<int>(type: "integer", nullable: false),
                    geo_data_fk = table.Column<int>(type: "integer", nullable: true),
                    loaded_datetime = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    code = table.Column<string>(type: "character varying(15)", maxLength: 15, nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_local_authorities", x => x.id);
                    table.ForeignKey(
                        name: "FK_local_authorities_geo_data_geo_data_fk",
                        column: x => x.geo_data_fk,
                        principalTable: "geo_data",
                        principalColumn: "id");
                    table.ForeignKey(
                        name: "FK_local_authorities_regions_region_fk",
                        column: x => x.region_fk,
                        principalTable: "regions",
                        principalColumn: "id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "care_provider_locations",
                columns: table => new
                {
                    id = table.Column<int>(type: "integer", nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
                    name = table.Column<string>(type: "character varying(100)", maxLength: 100, nullable: false),
                    care_provider_fk = table.Column<int>(type: "integer", nullable: false),
                    address = table.Column<string>(type: "character varying(255)", maxLength: 255, nullable: false),
                    nominated_individual = table.Column<string>(type: "character varying(255)", maxLength: 255, nullable: false),
                    local_authority_fk = table.Column<int>(type: "integer", nullable: false),
                    geo_data_fk = table.Column<int>(type: "integer", nullable: true),
                    loaded_datetime = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    code = table.Column<string>(type: "character varying(15)", maxLength: 15, nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_care_provider_locations", x => x.id);
                    table.ForeignKey(
                        name: "FK_care_provider_locations_care_providers_care_provider_fk",
                        column: x => x.care_provider_fk,
                        principalTable: "care_providers",
                        principalColumn: "id",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "FK_care_provider_locations_geo_data_geo_data_fk",
                        column: x => x.geo_data_fk,
                        principalTable: "geo_data",
                        principalColumn: "id");
                    table.ForeignKey(
                        name: "FK_care_provider_locations_local_authorities_local_authority_fk",
                        column: x => x.local_authority_fk,
                        principalTable: "local_authorities",
                        principalColumn: "id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "postcodes",
                columns: table => new
                {
                    id = table.Column<int>(type: "integer", nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
                    display_postcode = table.Column<string>(type: "character varying(8)", maxLength: 8, nullable: false),
                    local_authority_fk = table.Column<int>(type: "integer", nullable: false),
                    geo_data_fk = table.Column<int>(type: "integer", nullable: true),
                    loaded_datetime = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    code = table.Column<string>(type: "character varying(15)", maxLength: 15, nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_postcodes", x => x.id);
                    table.ForeignKey(
                        name: "FK_postcodes_geo_data_geo_data_fk",
                        column: x => x.geo_data_fk,
                        principalTable: "geo_data",
                        principalColumn: "id");
                    table.ForeignKey(
                        name: "FK_postcodes_local_authorities_local_authority_fk",
                        column: x => x.local_authority_fk,
                        principalTable: "local_authorities",
                        principalColumn: "id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateIndex(
                name: "IX_bedcount_metric_fk",
                table: "bedcount",
                column: "metric_fk");

            migrationBuilder.CreateIndex(
                name: "IX_bedcount_per_hundred_thousand_adults_metric_fk",
                table: "bedcount_per_hundred_thousand_adults",
                column: "metric_fk");

            migrationBuilder.CreateIndex(
                name: "IX_care_provider_locations_care_provider_fk",
                table: "care_provider_locations",
                column: "care_provider_fk");

            migrationBuilder.CreateIndex(
                name: "IX_care_provider_locations_geo_data_fk",
                table: "care_provider_locations",
                column: "geo_data_fk");

            migrationBuilder.CreateIndex(
                name: "IX_care_provider_locations_local_authority_fk",
                table: "care_provider_locations",
                column: "local_authority_fk");

            migrationBuilder.CreateIndex(
                name: "IX_countries_geo_data_fk",
                table: "countries",
                column: "geo_data_fk");

            migrationBuilder.CreateIndex(
                name: "IX_dementia_estimated_diagnosis_rate_65over_metric_fk",
                table: "dementia_estimated_diagnosis_rate_65over",
                column: "metric_fk");

            migrationBuilder.CreateIndex(
                name: "IX_dementia_prevalence_65over_metric_fk",
                table: "dementia_prevalence_65over",
                column: "metric_fk");

            migrationBuilder.CreateIndex(
                name: "IX_dementia_qof_prevalence_metric_fk",
                table: "dementia_qof_prevalence",
                column: "metric_fk");

            migrationBuilder.CreateIndex(
                name: "IX_dementia_register_65over_per100k_metric_fk",
                table: "dementia_register_65over_per100k",
                column: "metric_fk");

            migrationBuilder.CreateIndex(
                name: "IX_learning_disability_prevalence_metric_fk",
                table: "learning_disability_prevalence",
                column: "metric_fk");

            migrationBuilder.CreateIndex(
                name: "IX_local_authorities_geo_data_fk",
                table: "local_authorities",
                column: "geo_data_fk");

            migrationBuilder.CreateIndex(
                name: "IX_local_authorities_region_fk",
                table: "local_authorities",
                column: "region_fk");

            migrationBuilder.CreateIndex(
                name: "IX_median_bed_count_metric_fk",
                table: "median_bed_count",
                column: "metric_fk");

            migrationBuilder.CreateIndex(
                name: "IX_median_occupancy_metric_fk",
                table: "median_occupancy",
                column: "metric_fk");

            migrationBuilder.CreateIndex(
                name: "IX_metrics_metric_group_fk",
                table: "metrics",
                column: "metric_group_fk");

            migrationBuilder.CreateIndex(
                name: "IX_occupancy_rates_metric_fk",
                table: "occupancy_rates",
                column: "metric_fk");

            migrationBuilder.CreateIndex(
                name: "IX_perc_18_64_metric_fk",
                table: "perc_18_64",
                column: "metric_fk");

            migrationBuilder.CreateIndex(
                name: "IX_perc_65over_metric_fk",
                table: "perc_65over",
                column: "metric_fk");

            migrationBuilder.CreateIndex(
                name: "IX_perc_75over_metric_fk",
                table: "perc_75over",
                column: "metric_fk");

            migrationBuilder.CreateIndex(
                name: "IX_perc_85over_metric_fk",
                table: "perc_85over",
                column: "metric_fk");

            migrationBuilder.CreateIndex(
                name: "IX_perc_general_health_metric_fk",
                table: "perc_general_health",
                column: "metric_fk");

            migrationBuilder.CreateIndex(
                name: "IX_perc_household_ownership_metric_fk",
                table: "perc_household_ownership",
                column: "metric_fk");

            migrationBuilder.CreateIndex(
                name: "IX_perc_households_deprivation_deprived_metric_fk",
                table: "perc_households_deprivation_deprived",
                column: "metric_fk");

            migrationBuilder.CreateIndex(
                name: "IX_perc_households_one_person_metric_fk",
                table: "perc_households_one_person",
                column: "metric_fk");

            migrationBuilder.CreateIndex(
                name: "IX_perc_population_disability_metric_fk",
                table: "perc_population_disability",
                column: "metric_fk");

            migrationBuilder.CreateIndex(
                name: "IX_perc_unpaid_care_provider_metric_fk",
                table: "perc_unpaid_care_provider",
                column: "metric_fk");

            migrationBuilder.CreateIndex(
                name: "IX_postcodes_geo_data_fk",
                table: "postcodes",
                column: "geo_data_fk");

            migrationBuilder.CreateIndex(
                name: "IX_postcodes_local_authority_fk",
                table: "postcodes",
                column: "local_authority_fk");

            migrationBuilder.CreateIndex(
                name: "IX_regions_country_fk",
                table: "regions",
                column: "country_fk");

            migrationBuilder.CreateIndex(
                name: "IX_regions_geo_data_fk",
                table: "regions",
                column: "geo_data_fk");

            migrationBuilder.CreateIndex(
                name: "IX_total_population_metric_fk",
                table: "total_population",
                column: "metric_fk");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "bedcount");

            migrationBuilder.DropTable(
                name: "bedcount_per_hundred_thousand_adults");

            migrationBuilder.DropTable(
                name: "care_provider_locations");

            migrationBuilder.DropTable(
                name: "dementia_estimated_diagnosis_rate_65over");

            migrationBuilder.DropTable(
                name: "dementia_prevalence_65over");

            migrationBuilder.DropTable(
                name: "dementia_qof_prevalence");

            migrationBuilder.DropTable(
                name: "dementia_register_65over_per100k");

            migrationBuilder.DropTable(
                name: "learning_disability_prevalence");

            migrationBuilder.DropTable(
                name: "median_bed_count");

            migrationBuilder.DropTable(
                name: "median_occupancy");

            migrationBuilder.DropTable(
                name: "occupancy_rates");

            migrationBuilder.DropTable(
                name: "perc_18_64");

            migrationBuilder.DropTable(
                name: "perc_65over");

            migrationBuilder.DropTable(
                name: "perc_75over");

            migrationBuilder.DropTable(
                name: "perc_85over");

            migrationBuilder.DropTable(
                name: "perc_general_health");

            migrationBuilder.DropTable(
                name: "perc_household_ownership");

            migrationBuilder.DropTable(
                name: "perc_households_deprivation_deprived");

            migrationBuilder.DropTable(
                name: "perc_households_one_person");

            migrationBuilder.DropTable(
                name: "perc_population_disability");

            migrationBuilder.DropTable(
                name: "perc_unpaid_care_provider");

            migrationBuilder.DropTable(
                name: "postcodes");

            migrationBuilder.DropTable(
                name: "total_population");

            migrationBuilder.DropTable(
                name: "care_providers");

            migrationBuilder.DropTable(
                name: "local_authorities");

            migrationBuilder.DropTable(
                name: "metrics");

            migrationBuilder.DropTable(
                name: "regions");

            migrationBuilder.DropTable(
                name: "metric_groups");

            migrationBuilder.DropTable(
                name: "countries");

            migrationBuilder.DropTable(
                name: "geo_data");
        }
    }
}