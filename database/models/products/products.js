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
      tag_id: {
        type: DataTypes.INTEGER,
        allowNull: true,
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
      specification: {
        type: DataTypes.JSONB,
        allowNull: false,
        defaultValue: [],
      },
      specification_ar: {
        type: DataTypes.JSONB,
        allowNull: false,
        defaultValue: [],
      },
      data_sheet: {
        type: DataTypes.TEXT,
        allowNull: true,
      },
      test_reports_description: {
        type: DataTypes.TEXT,
        allowNull: true,
      },
      test_reports_description_ar: {
        type: DataTypes.TEXT,
        allowNull: true,
      },

      installation_instruction: {
        type: DataTypes.TEXT,
        allowNull: true,
      },
      installation_instruction_ar: {
        type: DataTypes.TEXT,
        allowNull: true,
      },
      maintenance: {
        type: DataTypes.TEXT,
        allowNull: true,
      },
      maintenance_ar: {
        type: DataTypes.TEXT,
        allowNull: true,
      },
      packing_and_shipping: {
        type: DataTypes.TEXT,
        allowNull: true,
      },
      packing_and_shipping_ar: {
        type: DataTypes.TEXT,
        allowNull: true,
      },
      media_path: {
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

      price: {
        type: DataTypes.DECIMAL,
        allowNull: false,
      },

      related_accessories: {
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

    Products.belongsToMany(models.Colors, {
      through: "product_color_map",
      foreignKey: "product_id", // column in junction pointing at THIS model
      otherKey: "color_id", // column in junction pointing at the OTHER model
      as: "colors",
    });

    // many to many with tags
    Products.belongsToMany(models.ProductTags, {
      through: "product_tag_map",
      foreignKey: "product_id", // column pointing at Products
      otherKey: "tag_id", // column pointing at ProductTags
      as: "hash_tags",
    });

    // many to many with Size
    Products.belongsToMany(models.Size, {
      through: "size_products",
      foreignKey: "product_id",
      otherKey: "size_id",
      as: "sizes",
    });

    // has many with prod faq
    Products.hasMany(models.ProductFaq, {
      foreignKey: "product_id",
      as: "productFaq",
    });

    Products.hasMany(models.ProductMedia, {
      foreignKey: "product_id",
      as: "productMedia",
    });

    // one to many with tags
    Products.belongsTo(models.Tags, {
      foreignKey: "tag_id",
      as: "tag",
      onDelete: "SET NULL",
    });

    // Many to many relations with products as related_products
    Products.belongsToMany(models.Products, {
      through: "product_related_products",
      foreignKey: "product_id",
      otherKey: "related_product_id",
      as: "relatedProducts",
    });
  };
  return Products;
};
