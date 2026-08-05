using System;
using Microsoft.EntityFrameworkCore.Migrations;
using Npgsql.EntityFrameworkCore.PostgreSQL.Metadata;

#nullable disable

namespace api.Migrations
{
    /// <inheritdoc />
    public partial class AddLocalAuthorityPeers : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.CreateTable(
                name: "local_authority_peers",
                columns: table => new
                {
                    id = table.Column<int>(type: "integer", nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
                    local_authority_fk = table.Column<int>(type: "integer", nullable: false),
                    peer_rank = table.Column<int>(type: "integer", nullable: false),
                    peer_local_authority_fk = table.Column<int>(type: "integer", nullable: false),
                    loaded_datetime = table.Column<DateTime>(type: "timestamp with time zone", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_local_authority_peers", x => x.id);
                    table.ForeignKey(
                        name: "FK_local_authority_peers_local_authorities_local_authority_fk",
                        column: x => x.local_authority_fk,
                        principalTable: "local_authorities",
                        principalColumn: "id",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "FK_local_authority_peers_local_authorities_peer_local_authorit~",
                        column: x => x.peer_local_authority_fk,
                        principalTable: "local_authorities",
                        principalColumn: "id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateIndex(
                name: "IX_local_authority_peers_local_authority_fk",
                table: "local_authority_peers",
                column: "local_authority_fk");

            migrationBuilder.CreateIndex(
                name: "IX_local_authority_peers_peer_local_authority_fk",
                table: "local_authority_peers",
                column: "peer_local_authority_fk");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "local_authority_peers");
        }
    }
}
