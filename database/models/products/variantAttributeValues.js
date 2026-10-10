const { DataTypes } = require("sequelize");

// One row per (variant, attribute value). `attribute_id` is stored alongside
// the value so a variant has exactly one value per attribute (unique on
// variant_id + attribute_id) and the value is guaranteed to belong to that
// attribute (checked in the controller).
module.exports = (sequelize) => {
  const VariantAttributeValues = sequelize.define(
    "VariantAttributeValues",
    {
      id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
      },
      variant_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },
      attribute_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },
      attribute_value_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },
    },
    {
      tableName: "variant_attribute_values",
      timestamps: true,
      indexes: [
        {
          name: "variant_attribute_values_variant_attribute_unique",
          unique: true,
          fields: ["variant_id", "attribute_id"],
        },
        {
          name: "variant_attribute_values_value_id",
          fields: ["attribute_value_id"],
        },
      ],
    },
  );

  VariantAttributeValues.associate = function (models) {
    VariantAttributeValues.belongsTo(models.ProductVariants, {
      foreignKey: "variant_id",
      as: "variant",
    });
    VariantAttributeValues.belongsTo(models.Attributes, {
      foreignKey: "attribute_id",
      as: "attribute",
    });
    VariantAttributeValues.belongsTo(models.AttributeValues, {
      foreignKey: "attribute_value_id",
      as: "attributeValue",
    });
  };

  return VariantAttributeValues;
};
