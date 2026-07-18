using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace Cms.Auth.Data.Migraciones
{
    /// <inheritdoc />
    public partial class IdAnexoUnicoNullable : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AlterColumn<int>(
                name: "IdAnexo",
                schema: "auth",
                table: "AspNetUsers",
                type: "integer",
                nullable: true,
                oldClrType: typeof(int),
                oldType: "integer");

            migrationBuilder.CreateIndex(
                name: "IX_AspNetUsers_IdAnexo",
                schema: "auth",
                table: "AspNetUsers",
                column: "IdAnexo",
                unique: true);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropIndex(
                name: "IX_AspNetUsers_IdAnexo",
                schema: "auth",
                table: "AspNetUsers");

            migrationBuilder.AlterColumn<int>(
                name: "IdAnexo",
                schema: "auth",
                table: "AspNetUsers",
                type: "integer",
                nullable: false,
                defaultValue: 0,
                oldClrType: typeof(int),
                oldType: "integer",
                oldNullable: true);
        }
    }
}
