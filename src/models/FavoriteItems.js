const { DataTypes } = require("sequelize");
const sequelize = require("../config/database");

const FavoriteItems = sequelize.define("FavoriteItems", {
    id: { type: DataTypes.BIGINT, autoIncrement: true, primaryKey: true },
    quantity: { type: DataTypes.INTEGER, allowNull: false },
}, { timestamps: true, tableName: "favorite_items" });

module.exports = FavoriteItems;