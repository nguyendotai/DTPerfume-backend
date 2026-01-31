const { DataTypes } = require("sequelize");
const sequelize = require("../config/database");

const FavoriteList = sequelize.define("FavoriteList", {
    id: { type: DataTypes.BIGINT, autoIncrement: true, primaryKey: true },
}, { timestamps: true, tableName: "favoriteList" });

module.exports = FavoriteList;