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

      subtitle: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      subtitle_ar: {
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

      price:{
        type: DataTypes.DECIMAL,
        allowNull: false
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

  return Products;
};
