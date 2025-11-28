const { DataTypes } = require("sequelize");
const sequelize = require("../config/database");

const ProductImage = sequelize.define("ProductImage", {
    id: { type: DataTypes.BIGINT, autoIncrement: true, primaryKey: true },
    url: { type: DataTypes.STRING(200), allowNull: false },
    alt: { type: DataTypes.STRING(200), allowNull: false },
}, { timestamps: true, tableName: "product_images" });

module.exports = ProductImage;