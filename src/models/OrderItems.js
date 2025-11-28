const { DataTypes } = require("sequelize");
const sequelize = require("../config/database");

const OrderItems = sequelize.define("OrderItems", {
    id: { type: DataTypes.BIGINT, autoIncrement: true, primaryKey: true },
    total_price: { type: DataTypes.INTEGER, allowNull: false },
    shipping_address: { type: DataTypes.DECIMAL(12, 2), allowNull: false }
}, { timestamps: true, tableName: "order_items" });

module.exports = OrderItems;