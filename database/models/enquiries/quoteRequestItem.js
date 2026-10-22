const { DataTypes } = require("sequelize");

module.exports = (sequelize) => {
  const QuoteRequestItem = sequelize.define(
    "QuoteRequestItem",
    {
      id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
      },
      quote_request_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },
      // The chosen product / variant are kept as a snapshot so the request stays
      // readable in the admin even if the catalog entry is renamed or deleted later.
      product_id: {
        type: DataTypes.INTEGER,
        allowNull: true,
      },
      product_title: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      product_title_ar: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      product_slug: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      variant_id: {
        type: DataTypes.INTEGER,
        allowNull: true,
      },
      variant_label: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      variant_label_ar: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      variant_sku: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      media_path: {
        type: DataTypes.TEXT,
        allowNull: true,
      },
      quantity: {
        type: DataTypes.INTEGER,
        allowNull: false,
        defaultValue: 1,
      },
      // Snapshot of the product's price at submission time, best-effort since
      // price is optional at the product level and variants carry no price of their own.
      unit_price_snapshot: {
        type: DataTypes.DECIMAL,
        allowNull: true,
      },
      deleted_at: {
        type: DataTypes.DATE,
      },
    },
    {
      tableName: "quote_request_items",
      timestamps: true,
      paranoid: true,
      deletedAt: "deleted_at",
    },
  );

  QuoteRequestItem.associate = function (models) {
    QuoteRequestItem.belongsTo(models.QuoteRequest, {
      foreignKey: "quote_request_id",
      as: "quoteRequest",
    });

    QuoteRequestItem.belongsTo(models.Products, {
      foreignKey: "product_id",
      as: "product",
    });

    QuoteRequestItem.belongsTo(models.ProductVariants, {
      foreignKey: "variant_id",
      as: "variant",
    });
  };

  return QuoteRequestItem;
};
