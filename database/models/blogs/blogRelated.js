const { DataTypes } = require("sequelize");

// Posts the admin picked by hand as "related" for a post (ordered). The storefront shows these
// first and fills the remaining slots automatically.
module.exports = (sequelize) =>
  sequelize.define(
    "BlogRelated",
    {
      blog_id: { type: DataTypes.INTEGER, primaryKey: true, allowNull: false, references: { model: "blogs", key: "id" }, onDelete: "CASCADE" },
      related_blog_id: { type: DataTypes.INTEGER, primaryKey: true, allowNull: false, references: { model: "blogs", key: "id" }, onDelete: "CASCADE" },
      sort_order: { type: DataTypes.INTEGER, allowNull: false, defaultValue: 0 },
    },
    { tableName: "blog_related_map", timestamps: false },
  );
