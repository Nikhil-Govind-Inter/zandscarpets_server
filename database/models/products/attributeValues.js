const { DataTypes } = require("sequelize");
const { generateSlug } = require("../../../utils/slugHelper");

module.exports = (sequelize) => {
  const AttributeValues = sequelize.define(
    "AttributeValues",
    {
      id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
      },
      attribute_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },
      value: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      value_ar: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      slug: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      media_path: {
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
      color_code: {
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
      tableName: "attribute_values",
      timestamps: true,
      paranoid: true,
      deletedAt: "deleted_at",
      indexes: [
        {
          name: "attribute_values_slug_active_unique",
          unique: true,
          fields: ["attribute_id", sequelize.fn("lower", sequelize.col("slug"))],
          where: { deleted_at: null },
        },
      ],
    },
  );

  AttributeValues.beforeValidate((instance) => {
    const source = instance.slug || instance.value;
    const slug = source ? generateSlug(source) : "";
    instance.slug = slug || null;
  });

  AttributeValues.associate = function (models) {
    AttributeValues.belongsTo(models.Attributes, {
      foreignKey: "attribute_id",
      as: "attribute",
    });
  };

  return AttributeValues;
};