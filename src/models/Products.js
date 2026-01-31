const { DataTypes } = require("sequelize");
const sequelize = require("../config/database");

const Product = sequelize.define("Product", {
    id: { type: DataTypes.BIGINT, autoIncrement: true, primaryKey: true },
    name: { type: DataTypes.STRING(200), allowNull: false },
    slug: { type: DataTypes.STRING(200), allowNull: false },
    type: { type: DataTypes.ENUM("single", "set"), allowNull: false },
    description: { type: DataTypes.TEXT },
    concentration: { type: DataTypes.ENUM("EDP", "EDT", "Parfum"), allowNull: false },
    gender: { type: DataTypes.ENUM("male", "female", "unisex"), allowNull: false },
    status: { type: DataTypes.BOOLEAN, allowNull: false },
}, { timestamps: true, tableName: "products" });

module.exports = Product;