const { DataTypes } = require("sequelize");
const sequelize = require("../config/database");

const User = sequelize.define("User", {
    id: { type: DataTypes.BIGINT, autoIncrement: true, primaryKey: true },
    name: { type: DataTypes.STRING(100), allowNull: false },
    email: { type: DataTypes.STRING(150), allowNull: false, unique: true },
    password: { type: DataTypes.STRING(255), allowNull: false },
    phone: { type: DataTypes.STRING(20) },
    role: { type: DataTypes.ENUM("customer", "admin", "staff"), defaultValue: "customer" },
    isActive: { type: DataTypes.BOOLEAN, defaultValue: true },
}, { timestamps: true, tableName: "users" });

module.exports = User;