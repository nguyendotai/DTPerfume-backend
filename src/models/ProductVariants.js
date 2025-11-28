const { DataTypes } = require("sequelize");
const sequelize = require("../config/database");

const ProductVariant = sequelize.define("ProductVariant", {
    id: { type: DataTypes.BIGINT, autoIncrement: true, primaryKey: true },
    volume_ml: { type: DataTypes.INTEGER },
    sku: { type: DataTypes.STRING(200), allowNull: false },
    price: { type: DataTypes.DECIMAL(12, 2) },
    stock:  { type: DataTypes.INTEGER, allowNull: false },
    barcode: { type: DataTypes.STRING(200), allowNull: false },
}, { timestamps: true, tableName: "product_variants" });

module.exports = ProductVariant;