const { DataTypes } = require("sequelize");

// Singleton row with the blog pages' headings
module.exports = (sequelize) => {
  const BlogCms = sequelize.define(
    "blogCms",
    {
      id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
      // heading above the post list
      title: { type: DataTypes.STRING, allowNull: false },
      title_ar: { type: DataTypes.STRING, allowNull: true },
      // heading of the related posts on a post page
      related_title: { type: DataTypes.STRING, allowNull: true },
      related_title_ar: { type: DataTypes.STRING, allowNull: true },
    },
    {
      tableName: "blog_cms",
      timestamps: true,
      paranoid: true,
      deletedAt: "deleted_at",
    },
  );

  return BlogCms;
};
