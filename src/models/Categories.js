const { DataTypes } = require("sequelize");
const sequelize = require("../config/database");

function slugify(str) {
  return str
    .toString()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-");
}

const Category = sequelize.define("Category", {
    id: { type: DataTypes.BIGINT, autoIncrement: true, primaryKey: true },
    name: { type: DataTypes.STRING(100), allowNull: false },
    slug: { type: DataTypes.STRING(200), allowNull: false },
    description: { type: DataTypes.TEXT },
}, { timestamps: true, tableName: "categories" });

Category.slugify = slugify;

module.exports = Category;