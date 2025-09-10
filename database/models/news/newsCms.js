const { DataTypes } = require("sequelize");

module.exports = (sequelize) => {
    const NewsCms = sequelize.define(
        "NewsCms",
        {
            id: {
                type: DataTypes.INTEGER,
                primaryKey: true,
                autoIncrement: true,
            },
            banner_super_title: {
                type: DataTypes.TEXT,
                allowNull: true,
            },
            banner_title: {
                type: DataTypes.TEXT,
                allowNull: true,
            },
            banner_description: {
                type: DataTypes.TEXT,
                allowNull: true,
            },
            recent_news_title: {
                type: DataTypes.TEXT,
                allowNull: true,
            },
            all_news_title: {
                type: DataTypes.TEXT,
                allowNull: true,
            },
        },
        {
            tableName: "news_cms",
            timestamps: true,
            createdAt: "created_at",
            updatedAt: "updated_at",
        }
    );

    return NewsCms;
};
