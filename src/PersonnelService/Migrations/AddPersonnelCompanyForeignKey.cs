using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace PersonnelService.Migrations
{
    /// <inheritdoc />
    public partial class AddPersonnelCompanyForeignKey : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            // Add foreign key constraint between Personnel and Company
            migrationBuilder.CreateIndex(
                name: "IX_Personnel_CompanyId",
                table: "Personnel",
                column: "CompanyId");

            migrationBuilder.AddForeignKey(
                name: "FK_Personnel_Companies_CompanyId",
                table: "Personnel",
                column: "CompanyId",
                principalTable: "Companies",
                principalColumn: "Id",
                onDelete: ReferentialAction.SetNull);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_Personnel_Companies_CompanyId",
                table: "Personnel");

            migrationBuilder.DropIndex(
                name: "IX_Personnel_CompanyId",
                table: "Personnel");
        }
    }
}
