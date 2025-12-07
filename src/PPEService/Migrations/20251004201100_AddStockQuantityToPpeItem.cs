using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace PPEService.Migrations
{
    /// <inheritdoc />
    public partial class AddStockQuantityToPpeItem : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<int>(
                name: "StockQuantity",
                table: "ppe_items",
                type: "int",
                nullable: false,
                defaultValue: 0);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "StockQuantity",
                table: "ppe_items");
        }
    }
}
