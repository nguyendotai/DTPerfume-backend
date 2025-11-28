const { DataTypes } = require("sequelize");
const sequelize = require("../config/database");

const Review = sequelize.define("Review", {
    id: { type: DataTypes.BIGINT, autoIncrement: true, primaryKey: true },
    rating: { type: DataTypes.INTEGER, allowNull: false },
    comment: { type: DataTypes.TEXT, allowNull: false },
}, { timestamps: true, tableName: "reviews" });

module.exports = Review;