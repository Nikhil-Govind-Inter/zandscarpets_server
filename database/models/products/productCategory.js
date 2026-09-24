const { DataTypes } = require("sequelize");

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
    },
  );

  ProductCategories.associate = function (models) {
    ProductCategories.belongsTo(models.Industry, {
      foreignKey: "industry_id",
      as: "industry",
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
