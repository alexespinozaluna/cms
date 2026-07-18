using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace Cms.Auth.Data.Migraciones
{
    /// <inheritdoc />
    public partial class VinculoAnexoWeb : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.RenameColumn(
                name: "CodigoProveedor",
                schema: "auth",
                table: "AspNetUsers",
                newName: "Telefono");

            migrationBuilder.RenameColumn(
                name: "CodigoClienteErp",
                schema: "auth",
                table: "AspNetUsers",
                newName: "NroDni");

            migrationBuilder.AddColumn<string>(
                name: "Cip",
                schema: "auth",
                table: "AspNetUsers",
                type: "text",
                nullable: true);

            migrationBuilder.AddColumn<int>(
                name: "IdAnexo",
                schema: "auth",
                table: "AspNetUsers",
                type: "integer",
                nullable: false,
                defaultValue: 0);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "Cip",
                schema: "auth",
                table: "AspNetUsers");

            migrationBuilder.DropColumn(
                name: "IdAnexo",
                schema: "auth",
                table: "AspNetUsers");

            migrationBuilder.RenameColumn(
                name: "Telefono",
                schema: "auth",
                table: "AspNetUsers",
                newName: "CodigoProveedor");

            migrationBuilder.RenameColumn(
                name: "NroDni",
                schema: "auth",
                table: "AspNetUsers",
                newName: "CodigoClienteErp");
        }
    }
}
