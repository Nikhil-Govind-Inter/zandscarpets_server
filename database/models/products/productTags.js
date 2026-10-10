const { DataTypes } = require("sequelize");

module.exports = (sequelize) => {
  const ProductTags = sequelize.define(
    "ProductTags",
    {
      id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
      },
      title: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      title_ar: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      is_active: {
        type: DataTypes.BOOLEAN,
        defaultValue: true,
      },
      is_global: {
        type: DataTypes.BOOLEAN,
        defaultValue: false,
      },
      is_product_badge: {
        type: DataTypes.BOOLEAN,
        defaultValue: false,
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
      tableName: "product_tags",
      timestamps: true,
      paranoid: true,
      deletedAt: "deleted_at",
    },
  );

  ProductTags.associate = function (models) {
    // many to many with products
    ProductTags.belongsToMany(models.Products, {
      through: "product_tag_map",
      foreignKey: "tag_id", // column pointing at ProductTags
      otherKey: "product_id", // column pointing at Products
      as: "products",
    });
  };

  return ProductTags;
};
