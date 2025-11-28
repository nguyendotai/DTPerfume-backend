const { DataTypes } = require("sequelize");
const sequelize = require("../config/database");

const Carts = sequelize.define("Carts", {
    id: { type: DataTypes.BIGINT, autoIncrement: true, primaryKey: true },
}, { timestamps: true, tableName: "carts" });

module.exports = Carts;