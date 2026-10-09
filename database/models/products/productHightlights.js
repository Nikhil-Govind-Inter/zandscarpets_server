const { DataTypes } = require("sequelize");

module.exports = (sequelize) => {
  const ProductHighlights = sequelize.define(
    "ProductHighlights",
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
      sort_order: {
        type: DataTypes.SMALLINT,
        defaultValue: 0,
      },
      deleted_at: {
        type: DataTypes.DATE,
      },
    },
    {
      tableName: "product_highlights",
      timestamps: true,
      paranoid: true,
      deletedAt: "deleted_at",
    },
  );

  ProductHighlights.associate = function (models) {
    // many-to-many with categories via a join table managed by Sequelize
    ProductHighlights.belongsToMany(models.ProductCategories, {
      through: "product_category_highlights",
      as: "categories",
      foreignKey: "highlight_id",
      otherKey: "category_id",
    });
  };

  return ProductHighlights;
};
