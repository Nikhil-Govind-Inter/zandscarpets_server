const { DataTypes } = require("sequelize");
const { generateSlug } = require("../../../utils/slugHelper");

module.exports = (sequelize) => {
  const Blogs = sequelize.define(
    "Blogs",
    {
      id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
      slug: { type: DataTypes.STRING, allowNull: true },
      title: { type: DataTypes.STRING, allowNull: false },
      title_ar: { type: DataTypes.STRING, allowNull: true },
      // card text and meta fallback
      excerpt: { type: DataTypes.TEXT, allowNull: false },
      excerpt_ar: { type: DataTypes.TEXT, allowNull: true },
      // rich-text article body (HTML); `[gallery]` on its own line marks where the swiper goes
      content: { type: DataTypes.TEXT, allowNull: false },
      content_ar: { type: DataTypes.TEXT, allowNull: true },
      author_name: { type: DataTypes.STRING, allowNull: true },
      author_name_ar: { type: DataTypes.STRING, allowNull: true },
      // hero image
      media_path: { type: DataTypes.TEXT, allowNull: true },
      media_alt: { type: DataTypes.STRING, allowNull: true },
      media_alt_ar: { type: DataTypes.STRING, allowNull: true },
      // shown date and the Latest / Oldest sort; a future date keeps the post hidden until then
      published_at: { type: DataTypes.DATE, allowNull: false, defaultValue: DataTypes.NOW },
      is_active: { type: DataTypes.BOOLEAN, defaultValue: true },
      deleted_at: { type: DataTypes.DATE },
    },
    {
      tableName: "blogs",
      timestamps: true,
      paranoid: true,
      deletedAt: "deleted_at",
      indexes: [
        {
          name: "blogs_slug_active_unique",
          unique: true,
          fields: [sequelize.fn("lower", sequelize.col("slug"))],
          where: { deleted_at: null },
        },
        { name: "blogs_published_at", fields: ["published_at"] },
      ],
    },
  );

  Blogs.beforeValidate((instance) => {
    const source = instance.slug || instance.title;
    const slug = source ? generateSlug(source) : "";
    instance.slug = slug || null;
  });

  Blogs.associate = function (models) {
    Blogs.hasMany(models.BlogImages, { foreignKey: "blog_id", as: "images" });
    Blogs.belongsToMany(models.BlogTags, {
      through: "blog_tag_map",
      as: "tags",
      foreignKey: "blog_id",
      otherKey: "tag_id",
    });
    Blogs.belongsToMany(models.ProductCategories, {
      through: "blog_category_map",
      as: "categories",
      foreignKey: "blog_id",
      otherKey: "category_id",
    });
    Blogs.hasMany(models.BlogRelated, { foreignKey: "blog_id", as: "related_links" });
  };

  return Blogs;
};
