const { DataTypes } = require("sequelize");

// Which attributes a product uses (Size, Color, ...), with display order.
// Every variant of the product must carry exactly one value for each of these
// attributes. Managed as an explicit model so `sort_order` lives on the link.
module.exports = (sequelize) => {
  const ProductAttributes = sequelize.define(
    "ProductAttributes",
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
      attribute_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },
      sort_order: {
        type: DataTypes.SMALLINT,
        defaultValue: 0,
      },
    },
    {
      tableName: "product_attributes",
      timestamps: true,
      indexes: [
        {
          name: "product_attributes_product_attribute_unique",
          unique: true,
          fields: ["product_id", "attribute_id"],
        },
        { name: "product_attributes_attribute_id", fields: ["attribute_id"] },
      ],
    },
  );

  ProductAttributes.associate = function (models) {
    ProductAttributes.belongsTo(models.Products, {
      foreignKey: "product_id",
      as: "product",
    });
    ProductAttributes.belongsTo(models.Attributes, {
      foreignKey: "attribute_id",
      as: "attribute",
    });
  };

  return ProductAttributes;
};
