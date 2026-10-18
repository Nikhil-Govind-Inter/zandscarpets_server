const { DataTypes } = require("sequelize");
const { generateSlug } = require("../../../utils/slugHelper");

module.exports = (sequelize) => {
  const BlogTags = sequelize.define(
    "BlogTags",
    {
      id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
      title: { type: DataTypes.STRING, allowNull: false },
      title_ar: { type: DataTypes.STRING, allowNull: false, defaultValue: "" },
      slug: { type: DataTypes.STRING, allowNull: true },
      is_active: { type: DataTypes.BOOLEAN, defaultValue: true },
      sort_order: { type: DataTypes.SMALLINT, defaultValue: 0 },
      deleted_at: { type: DataTypes.DATE },
    },
    {
      tableName: "blog_tags",
      timestamps: true,
      paranoid: true,
      deletedAt: "deleted_at",
      indexes: [
        {
          name: "blog_tags_slug_active_unique",
          unique: true,
          fields: [sequelize.fn("lower", sequelize.col("slug"))],
          where: { deleted_at: null },
        },
      ],
    },
  );

  BlogTags.beforeValidate((instance) => {
    const source = instance.slug || instance.title;
    const slug = source ? generateSlug(source) : "";
    instance.slug = slug || null;
  });

  BlogTags.associate = function (models) {
    BlogTags.belongsToMany(models.Blogs, {
      through: "blog_tag_map",
      as: "blogs",
      foreignKey: "tag_id",
      otherKey: "blog_id",
    });
  };

  return BlogTags;
};
