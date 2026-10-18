const { DataTypes } = require("sequelize");

// Gallery (swiper) images of a post: one row per image
module.exports = (sequelize) => {
  const BlogImages = sequelize.define(
    "BlogImages",
    {
      id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
      blog_id: { type: DataTypes.INTEGER, allowNull: false },
      media_path: { type: DataTypes.TEXT, allowNull: false },
      media_alt: { type: DataTypes.STRING, allowNull: true },
      media_alt_ar: { type: DataTypes.STRING, allowNull: true },
      sort_order: { type: DataTypes.SMALLINT, defaultValue: 0 },
      deleted_at: { type: DataTypes.DATE },
    },
    {
      tableName: "blog_images",
      timestamps: true,
      paranoid: true,
      deletedAt: "deleted_at",
      indexes: [{ name: "blog_images_blog_sort", fields: ["blog_id", "sort_order"] }],
    },
  );

  BlogImages.associate = function (models) {
    BlogImages.belongsTo(models.Blogs, { foreignKey: "blog_id", as: "blog" });
  };

  return BlogImages;
};
