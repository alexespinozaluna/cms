using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace Cms.Auth.Data.Migraciones
{
    /// <inheritdoc />
    public partial class EstructuraUsuario : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropIndex(
                name: "IX_AspNetUsers_IdAnexo",
                schema: "auth",
                table: "AspNetUsers");

            migrationBuilder.RenameColumn(
                name: "IdAnexo",
                schema: "auth",
                table: "AspNetUsers",
                newName: "IdUserSistema");

            migrationBuilder.RenameColumn(
                name: "Cip",
                schema: "auth",
                table: "AspNetUsers",
                newName: "TipoDoc");

            migrationBuilder.AddColumn<string>(
                name: "CodUsuario",
                schema: "auth",
                table: "AspNetUsers",
                type: "text",
                nullable: true);

            migrationBuilder.AddColumn<int>(
                name: "IdUserRef",
                schema: "auth",
                table: "AspNetUsers",
                type: "integer",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "NroRuc",
                schema: "auth",
                table: "AspNetUsers",
                type: "text",
                nullable: true);

            migrationBuilder.CreateIndex(
                name: "IX_AspNetUsers_IdUserRef",
                schema: "auth",
                table: "AspNetUsers",
                column: "IdUserRef",
                unique: true);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropIndex(
                name: "IX_AspNetUsers_IdUserRef",
                schema: "auth",
                table: "AspNetUsers");

            migrationBuilder.DropColumn(
                name: "CodUsuario",
                schema: "auth",
                table: "AspNetUsers");

            migrationBuilder.DropColumn(
                name: "IdUserRef",
                schema: "auth",
                table: "AspNetUsers");

            migrationBuilder.DropColumn(
                name: "NroRuc",
                schema: "auth",
                table: "AspNetUsers");

            migrationBuilder.RenameColumn(
                name: "TipoDoc",
                schema: "auth",
                table: "AspNetUsers",
                newName: "Cip");

            migrationBuilder.RenameColumn(
                name: "IdUserSistema",
                schema: "auth",
                table: "AspNetUsers",
                newName: "IdAnexo");

            migrationBuilder.CreateIndex(
                name: "IX_AspNetUsers_IdAnexo",
                schema: "auth",
                table: "AspNetUsers",
                column: "IdAnexo",
                unique: true);
        }
    }
}
