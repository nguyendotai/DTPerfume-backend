const { DataTypes } = require("sequelize");
const sequelize = require("../config/database");

const CartItems = sequelize.define("CartItems", {
    id: { type: DataTypes.BIGINT, autoIncrement: true, primaryKey: true },
    quantity: { type: DataTypes.INTEGER, allowNull: false },
}, { timestamps: true, tableName: "cart_items" });

module.exports = CartItems;