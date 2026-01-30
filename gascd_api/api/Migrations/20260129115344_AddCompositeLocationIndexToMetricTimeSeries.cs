using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace api.Migrations
{
    /// <inheritdoc />
    public partial class AddCompositeLocationIndexToMetricTimeSeries : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.CreateIndex(
                name: "IX_total_population_location_code_location_type",
                table: "total_population",
                columns: new[] { "location_code", "location_type" });

            migrationBuilder.CreateIndex(
                name: "IX_perc_unpaid_care_provider_location_code_location_type",
                table: "perc_unpaid_care_provider",
                columns: new[] { "location_code", "location_type" });

            migrationBuilder.CreateIndex(
                name: "IX_perc_population_disability_location_code_location_type",
                table: "perc_population_disability",
                columns: new[] { "location_code", "location_type" });

            migrationBuilder.CreateIndex(
                name: "IX_perc_households_one_person_location_code_location_type",
                table: "perc_households_one_person",
                columns: new[] { "location_code", "location_type" });

            migrationBuilder.CreateIndex(
                name: "IX_perc_households_deprivation_deprived_location_code_location~",
                table: "perc_households_deprivation_deprived",
                columns: new[] { "location_code", "location_type" });

            migrationBuilder.CreateIndex(
                name: "IX_perc_household_ownership_location_code_location_type",
                table: "perc_household_ownership",
                columns: new[] { "location_code", "location_type" });

            migrationBuilder.CreateIndex(
                name: "IX_perc_general_health_location_code_location_type",
                table: "perc_general_health",
                columns: new[] { "location_code", "location_type" });

            migrationBuilder.CreateIndex(
                name: "IX_perc_85over_location_code_location_type",
                table: "perc_85over",
                columns: new[] { "location_code", "location_type" });

            migrationBuilder.CreateIndex(
                name: "IX_perc_75over_location_code_location_type",
                table: "perc_75over",
                columns: new[] { "location_code", "location_type" });

            migrationBuilder.CreateIndex(
                name: "IX_perc_65over_location_code_location_type",
                table: "perc_65over",
                columns: new[] { "location_code", "location_type" });

            migrationBuilder.CreateIndex(
                name: "IX_perc_18_64_location_code_location_type",
                table: "perc_18_64",
                columns: new[] { "location_code", "location_type" });

            migrationBuilder.CreateIndex(
                name: "IX_occupancy_rates_location_code_location_type",
                table: "occupancy_rates",
                columns: new[] { "location_code", "location_type" });

            migrationBuilder.CreateIndex(
                name: "IX_num_clients_long_term_support_location_code_location_type",
                table: "num_clients_long_term_support",
                columns: new[] { "location_code", "location_type" });

            migrationBuilder.CreateIndex(
                name: "IX_median_occupancy_location_code_location_type",
                table: "median_occupancy",
                columns: new[] { "location_code", "location_type" });

            migrationBuilder.CreateIndex(
                name: "IX_median_bed_count_location_code_location_type",
                table: "median_bed_count",
                columns: new[] { "location_code", "location_type" });

            migrationBuilder.CreateIndex(
                name: "IX_learning_disability_prevalence_location_code_location_type",
                table: "learning_disability_prevalence",
                columns: new[] { "location_code", "location_type" });

            migrationBuilder.CreateIndex(
                name: "IX_dementia_register_65over_per100k_location_code_location_type",
                table: "dementia_register_65over_per100k",
                columns: new[] { "location_code", "location_type" });

            migrationBuilder.CreateIndex(
                name: "IX_dementia_qof_prevalence_location_code_location_type",
                table: "dementia_qof_prevalence",
                columns: new[] { "location_code", "location_type" });

            migrationBuilder.CreateIndex(
                name: "IX_dementia_prevalence_65over_location_code_location_type",
                table: "dementia_prevalence_65over",
                columns: new[] { "location_code", "location_type" });

            migrationBuilder.CreateIndex(
                name: "IX_dementia_estimated_diagnosis_rate_65over_location_code_loca~",
                table: "dementia_estimated_diagnosis_rate_65over",
                columns: new[] { "location_code", "location_type" });

            migrationBuilder.CreateIndex(
                name: "IX_bedcount_per_hundred_thousand_adults_location_code_location~",
                table: "bedcount_per_hundred_thousand_adults",
                columns: new[] { "location_code", "location_type" });

            migrationBuilder.CreateIndex(
                name: "IX_bedcount_location_code_location_type",
                table: "bedcount",
                columns: new[] { "location_code", "location_type" });
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropIndex(
                name: "IX_total_population_location_code_location_type",
                table: "total_population");

            migrationBuilder.DropIndex(
                name: "IX_perc_unpaid_care_provider_location_code_location_type",
                table: "perc_unpaid_care_provider");

            migrationBuilder.DropIndex(
                name: "IX_perc_population_disability_location_code_location_type",
                table: "perc_population_disability");

            migrationBuilder.DropIndex(
                name: "IX_perc_households_one_person_location_code_location_type",
                table: "perc_households_one_person");

            migrationBuilder.DropIndex(
                name: "IX_perc_households_deprivation_deprived_location_code_location~",
                table: "perc_households_deprivation_deprived");

            migrationBuilder.DropIndex(
                name: "IX_perc_household_ownership_location_code_location_type",
                table: "perc_household_ownership");

            migrationBuilder.DropIndex(
                name: "IX_perc_general_health_location_code_location_type",
                table: "perc_general_health");

            migrationBuilder.DropIndex(
                name: "IX_perc_85over_location_code_location_type",
                table: "perc_85over");

            migrationBuilder.DropIndex(
                name: "IX_perc_75over_location_code_location_type",
                table: "perc_75over");

            migrationBuilder.DropIndex(
                name: "IX_perc_65over_location_code_location_type",
                table: "perc_65over");

            migrationBuilder.DropIndex(
                name: "IX_perc_18_64_location_code_location_type",
                table: "perc_18_64");

            migrationBuilder.DropIndex(
                name: "IX_occupancy_rates_location_code_location_type",
                table: "occupancy_rates");

            migrationBuilder.DropIndex(
                name: "IX_num_clients_long_term_support_location_code_location_type",
                table: "num_clients_long_term_support");

            migrationBuilder.DropIndex(
                name: "IX_median_occupancy_location_code_location_type",
                table: "median_occupancy");

            migrationBuilder.DropIndex(
                name: "IX_median_bed_count_location_code_location_type",
                table: "median_bed_count");

            migrationBuilder.DropIndex(
                name: "IX_learning_disability_prevalence_location_code_location_type",
                table: "learning_disability_prevalence");

            migrationBuilder.DropIndex(
                name: "IX_dementia_register_65over_per100k_location_code_location_type",
                table: "dementia_register_65over_per100k");

            migrationBuilder.DropIndex(
                name: "IX_dementia_qof_prevalence_location_code_location_type",
                table: "dementia_qof_prevalence");

            migrationBuilder.DropIndex(
                name: "IX_dementia_prevalence_65over_location_code_location_type",
                table: "dementia_prevalence_65over");

            migrationBuilder.DropIndex(
                name: "IX_dementia_estimated_diagnosis_rate_65over_location_code_loca~",
                table: "dementia_estimated_diagnosis_rate_65over");

            migrationBuilder.DropIndex(
                name: "IX_bedcount_per_hundred_thousand_adults_location_code_location~",
                table: "bedcount_per_hundred_thousand_adults");

            migrationBuilder.DropIndex(
                name: "IX_bedcount_location_code_location_type",
                table: "bedcount");
        }
    }
}