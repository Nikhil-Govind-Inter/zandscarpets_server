const { DataTypes } = require("sequelize");

module.exports = (sequelize) => {
  const ProductMedia = sequelize.define(
    "ProductMedia",
    {
      id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
      },
      product_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },
      media_type: {
        type: DataTypes.ENUM,
        allowNull: false,
        values: ["image", "video"],
      },
      media_path: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      thumbnail: {
        type: DataTypes.STRING,
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
      tableName: "product_media",
      timestamps: true,
      paranoid: true,
      deletedAt: "deleted_at",
    },
  );

  ProductMedia.associate = function (models) {
    ProductMedia.belongsTo(models.Products, {
      foreignKey: "product_id",
      as: "product",
    });
  };

  return ProductMedia;
};
