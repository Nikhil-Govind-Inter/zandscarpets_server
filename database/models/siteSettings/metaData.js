const { DataTypes } = require("sequelize");
const { PAGE_NAME_SLUGS } = require("../../seeders/pagenames");

module.exports = (sequelize) => {
  const MetaData = sequelize.define(
    "MetaData",
    {
      id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
      },
      type: {
        type: DataTypes.ENUM,
        values: ["page", "product", "product-variant", "blog", "project"],
        allowNull: false,
        defaultValue: "page",
      },
      page_name: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      product_id: {
        type: DataTypes.INTEGER,
        allowNull: true,
      },
      variant_id: {
        type: DataTypes.INTEGER,
        allowNull: true,
      },
      blog_id: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      project_id: {
        type: DataTypes.INTEGER,
        allowNull: true,
      },
      meta_title: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      meta_title_ar: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      meta_description: {
        type: DataTypes.TEXT,
        allowNull: false,
      },
      meta_description_ar: {
        type: DataTypes.TEXT,
        allowNull: true,
      },
      meta_keywords: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      meta_keywords_ar: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      other_meta: {
        type: DataTypes.TEXT,
        allowNull: true,
      },
      other_meta_ar: {
        type: DataTypes.TEXT,
        allowNull: true,
      },
      deleted_at: {
        type: DataTypes.DATE,
      },
    },
    {
      tableName: "meta_data",
      timestamps: true,
      paranoid: true,
      deletedAt: "deleted_at",
      indexes: [
        {
          name: "meta_data_page_name_unique",
          unique: true,
          fields: ["page_name"],
          where: { deleted_at: null },
        },
        {
          name: "meta_data_product_unique",
          unique: true,
          fields: ["product_id"],
          where: { deleted_at: null },
        },
        {
          name: "meta_data_variant_unique",
          unique: true,
          fields: ["variant_id"],
          where: { deleted_at: null },
        },
        {
          name: "meta_data_blog_unique",
          unique: true,
          fields: ["blog_id"],
          where: { deleted_at: null },
        },
        {
          name: "meta_data_project_unique",
          unique: true,
          fields: ["project_id"],
          where: { deleted_at: null },
        },
      ],
      validate: {
        exactlyOneTarget() {
          const { type, page_name, product_id, variant_id, blog_id, project_id } = this;
          const targets = [page_name, product_id, variant_id, blog_id, project_id].filter((value) => value !== null && value !== undefined);
          if (targets.length !== 1) {
            throw new Error("Meta data must reference exactly one of a page, product, variant, blog or project");
          }
          if (type === "page" && (page_name == null || product_id != null || variant_id != null || blog_id != null || project_id != null)) {
            throw new Error("A page meta row must set page_name and leave product_id/variant_id/blog_id/project_id empty");
          }
          if (type === "product" && (product_id == null || page_name != null || variant_id != null || blog_id != null || project_id != null)) {
            throw new Error("A product meta row must set product_id and leave page_name/variant_id/blog_id/project_id empty");
          }
          if (type === "product-variant" && (variant_id == null || page_name != null || product_id != null || blog_id != null || project_id != null)) {
            throw new Error("A product-variant meta row must set variant_id and leave page_name/product_id/blog_id/project_id empty");
          }
          if (type === "blog" && (blog_id == null || page_name != null || product_id != null || variant_id != null || project_id != null)) {
            throw new Error("A blog meta row must set blog_id and leave page_name/product_id/variant_id/project_id empty");
          }
          if (type === "project" && (project_id == null || page_name != null || product_id != null || variant_id != null || blog_id != null)) {
            throw new Error("A project meta row must set project_id and leave page_name/product_id/variant_id/blog_id empty");
          }
          if (type === "page" && page_name != null && !PAGE_NAME_SLUGS.includes(page_name)) {
            throw new Error(`"${page_name}" is not a recognised page name`);
          }
        },
      },
    },
  );

  MetaData.associate = (models) => {
    MetaData.belongsTo(models.Products, {
      foreignKey: "product_id",
      as: "product",
    });
    MetaData.belongsTo(models.ProductVariants, {
      foreignKey: "variant_id",
      as: "variant",
    });
    MetaData.belongsTo(models.Projects, {
      foreignKey: "project_id",
      as: "project",
    });
  };

  return MetaData;
};
