const { DataTypes } = require("sequelize");
const { generateSlug } = require("../../../utils/slugHelper");

module.exports = (sequelize) => {
  const ProductCategories = sequelize.define(
    "ProductCategories",
    {
      id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
      },
      parent_id: {
        type: DataTypes.INTEGER,
        allowNull: true,
      },
      industry_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },
      title: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      title_ar: {
        type: DataTypes.STRING,
        allowNull: false,
        defaultValue: "",
      },
      slug: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      description: {
        type: DataTypes.TEXT,
        allowNull: true,
      },
      description_ar: {
        type: DataTypes.TEXT,
        allowNull: true,
      },
      material_type: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      material_type_ar: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      media_path: {
        type: DataTypes.TEXT,
        allowNull: true,
      },
      is_active: {
        type: DataTypes.BOOLEAN,
        defaultValue: true,
      },
      sort_order: {
        type: DataTypes.SMALLINT,
        defaultValue: 0,
      },
      deleted_at: {
        type: DataTypes.DATE,
      },
    },
    {
      tableName: "product_categories",
      timestamps: true,
      paranoid: true,
      deletedAt: "deleted_at",
      indexes: [
        {
          name: "product_categories_slug_active_unique",
          unique: true,
          fields: [sequelize.fn("lower", sequelize.col("slug"))],
          where: { deleted_at: null },
        },
      ],
    },
  );

  // Uniform slug generation: always derive from title (or normalize a given
  // slug) before validation. Titles that cannot be slugified keep slug NULL,
  // which the partial unique index ignores.
  ProductCategories.beforeValidate((instance) => {
    const source = instance.slug || instance.title;
    const slug = source ? generateSlug(source) : "";
    instance.slug = slug || null;
  });

  ProductCategories.associate = function (models) {
    ProductCategories.belongsTo(models.Industry, {
      foreignKey: "industry_id",
      as: "industry",
    });

    ProductCategories.hasMany(models.Products, {
      foreignKey: "product_category_id",
      as: "products",
    });

    // self-relation: unlimited-depth parent/child tree in the same table
    ProductCategories.belongsTo(ProductCategories, {
      foreignKey: "parent_id",
      as: "parent",
    });
    ProductCategories.hasMany(ProductCategories, {
      foreignKey: "parent_id",
      as: "children",
    });

    // many-to-many with highlights via a join table managed by Sequelize
    ProductCategories.belongsToMany(models.ProductHighlights, {
      through: "product_category_highlights",
      as: "highlights",
      foreignKey: "category_id",
      otherKey: "highlight_id",
    });
  };

  return ProductCategories;
};
