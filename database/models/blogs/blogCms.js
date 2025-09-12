const { DataTypes } = require("sequelize");

module.exports = (sequelize) => {
    const BlogCms = sequelize.define(
        "BlogCms",
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
            recent_blog_title: {
                type: DataTypes.TEXT,
                allowNull: true,
            },
            all_blogs_title: {
                type: DataTypes.TEXT,
                allowNull: true,
            },
            footer_title: {
                type: DataTypes.TEXT,
                allowNull: true,
            },
            footer_description: {
                type: DataTypes.TEXT,
                allowNull: true,
            },
        },
        {
            tableName: "blog_cms",
            timestamps: true,
            createdAt: "created_at",
            updatedAt: "updated_at",
        }
    );

    return BlogCms;
};
