const { DataTypes } = require("sequelize");

// "This variant hides this one inherited item." Lets a variant be "same as
// the product, except these" while still picking up items added to the
// product later. Only valid against a product-level item belonging to the
// variant's own product, and only while the variant has no mapping of its
// own for that item's field — both enforced in mappingsController.js.
module.exports = (sequelize) => {
  const DetailItemExclusions = sequelize.define(
    "DetailItemExclusions",
    {
      variant_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
        primaryKey: true,
      },
      item_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
        primaryKey: true,
      },
    },
    {
      tableName: "detail_item_exclusions",
      timestamps: true,
      indexes: [{ name: "detail_item_exclusions_item_id", fields: ["item_id"] }],
    },
  );

  DetailItemExclusions.associate = function (models) {
    DetailItemExclusions.belongsTo(models.ProductVariants, {
      foreignKey: { name: "variant_id", onDelete: "CASCADE" },
      as: "variant",
    });
    DetailItemExclusions.belongsTo(models.DetailItems, {
      foreignKey: { name: "item_id", onDelete: "CASCADE" },
      as: "item",
    });
  };

  return DetailItemExclusions;
};
