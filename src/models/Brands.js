const { DataTypes } = require("sequelize");
const sequelize = require("../config/database");

const Brand = sequelize.define(
    "Brand",
    {
        id: {
            type: DataTypes.INTEGER,
            autoIncrement: true,
            primaryKey: true,
        },

        name: {
            type: DataTypes.STRING,
            allowNull: false,
            unique: true,
        },

        slug: {
            type: DataTypes.STRING,
            allowNull: false,
            unique: true,
        },

        logo: {
            // 👉 Ảnh brand (logo), KHÔNG liên quan ProductImages
            type: DataTypes.STRING,
            allowNull: true,
        },

        banner: { 
            type: DataTypes.STRING,
            allowNull: true
        },

        description: {
            type: DataTypes.TEXT,
            allowNull: true,
        },

        status: {
            type: DataTypes.BOOLEAN,
            defaultValue: true,
        },
    },
    {
        tableName: "brands",
        timestamps: true,
    }
);

module.exports = Brand;
