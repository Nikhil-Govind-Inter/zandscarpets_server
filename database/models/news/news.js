const { DataTypes } = require("sequelize");

module.exports = (sequelize) => {
    const News = sequelize.define(
        "News",
        {
            id: {
                type: DataTypes.INTEGER,
                primaryKey: true,
                autoIncrement: true,
            },
            title: {
                type: DataTypes.TEXT,
                allowNull: false,
            },
            slug: {
                type: DataTypes.TEXT,
                allowNull: false,
            },
            description: {
                type: DataTypes.TEXT,
                allowNull: true,
            },
            thumbnail: {
                type: DataTypes.TEXT,
                allowNull: true,
            },
            thumbnail_alt: {
                type: DataTypes.STRING,
                allowNull: true,
            },
            published_on: {
                type: DataTypes.DATE,
                allowNull: true,
            },
            reading_time: {
                type: DataTypes.STRING,
                allowNull: true,
            },
            banner_media_desktop_path: {
                type: DataTypes.TEXT,
                allowNull: true,
            },
            banner_media_mobile_path: {
                type: DataTypes.TEXT,
                allowNull: true,
            },
            banner_media_alt: {
                type: DataTypes.STRING,
                allowNull: true,
            },

            sub_description: {
                type: DataTypes.TEXT,
                allowNull: true,
            },
            is_featured_active: {
                type: DataTypes.BOOLEAN,
                allowNull: false,
                defaultValue: false,
            },
            sort_order: {
                type: DataTypes.SMALLINT,
                defaultValue: 0,
            },
            status: {
                type: DataTypes.BOOLEAN,
                defaultValue: true,
            },
            deleted_at: {
                type: DataTypes.DATE,
            },
        },
        {
            tableName: "news",
            timestamps: true,
            deletedAt: "deleted_at",
        }
    );

    return News;
};
