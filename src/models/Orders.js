const { DataTypes } = require("sequelize");
const sequelize = require("../config/database");

const Order = sequelize.define("Order", {
    id: { type: DataTypes.BIGINT, autoIncrement: true, primaryKey: true },
    total_price: { type: DataTypes.DECIMAL(12, 2), allowNull: false },
    discount: { type: DataTypes.DECIMAL(12, 2), allowNull: false },
    status: { type: DataTypes.ENUM("pending", "paid", "shipped", "completed", "cancelled"), allowNull: false },
    payment_method: { type: DataTypes.ENUM("cod", "credit_card", "paypal", "momo", "vnpay"), allowNull: false },
    shipping_address: {
        type: DataTypes.TEXT,
        allowNull: false,
        get() {
            const raw = this.getDataValue("shipping_address");
            return raw ? JSON.parse(raw) : null;
        },
        set(value) {
            this.setDataValue("shipping_address", JSON.stringify(value));
        }
    }

}, { timestamps: true, tableName: "orders" });

module.exports = Order;