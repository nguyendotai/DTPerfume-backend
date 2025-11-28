const { DataTypes } = require("sequelize");
const sequelize = require("../config/database");

const ProductCategory = sequelize.define("ProductCategory", {
    id: { type: DataTypes.BIGINT, autoIncrement: true, primaryKey: true },
}, {
    timestamps: true,
    tableName: "product_categories",
});

module.exports = ProductCategory;
