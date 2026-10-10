const { DataTypes } = require("sequelize");

module.exports = (sequelize) => {
  const Products = sequelize.define(
    "Products",
    {
      id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
      },
      product_category_id: {
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
      },
      slug: {
        type: DataTypes.STRING,
        allowNull: false,
      },

      short_description: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      short_description_ar: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      product_description: {
        type: DataTypes.TEXT,
        allowNull: false,
      },
      product_description_ar: {
        type: DataTypes.TEXT,
        allowNull: false,
      },
      main_media_path: {
        type: DataTypes.TEXT,
        allowNull: true,
      },
      media_alt: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      media_alt_ar: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      list_media_path: {
        type: DataTypes.TEXT,
        allowNull: true,
      },
      list_media_alt: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      list_media_alt_ar: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      price: {
        type: DataTypes.DECIMAL,
        allowNull: true,
      },
      is_active: {
        type: DataTypes.BOOLEAN,
        defaultValue: true,
      },
      list_in_navbar: {
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
      tableName: "products",
      timestamps: true,
      paranoid: true,
      deletedAt: "deleted_at",
    },
  );

  Products.associate = function (models) {
    Products.belongsTo(models.ProductCategories, {
      foreignKey: "product_category_id",
      as: "category",
    });

    // many to many with the shared product label master
    // (features / tags / specifications, discriminated by `type`).
    Products.belongsToMany(models.ProductLabels, {
      through: "product_label_map",
      foreignKey: "product_id", // column pointing at Products
      otherKey: "label_id", // column pointing at ProductLabels
      as: "labels",
    });

    Products.belongsToMany(models.Products, {
      through: "product_related_products",
      foreignKey: "product_id",
      otherKey: "related_product_id",
      as: "relatedProducts",
    });

    // Attributes the product uses to build variants (Size, Color, ...).
    Products.belongsToMany(models.Attributes, {
      through: models.ProductAttributes,
      foreignKey: "product_id",
      otherKey: "attribute_id",
      as: "attributes",
    });

    Products.hasMany(models.ProductVariants, {
      foreignKey: "product_id",
      as: "variants",
    });
  };
  return Products;
};
