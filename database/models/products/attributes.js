const { DataTypes } = require("sequelize");
const { generateSlug } = require("../../../utils/slugHelper");

module.exports = (sequelize) => {
  const Attributes = sequelize.define(
    "Attributes",
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
        defaultValue: "",
      },
      slug: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      // text | icon | color — describes what the linked attribute values
      // carry (text value, icon image, or a color bar / color photo).
      type: {
        type: DataTypes.ENUM,
        values: ["text", "icon", "color"],
        allowNull: false,
        defaultValue: "text",
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
      tableName: "attributes",
      timestamps: true,
      paranoid: true,
      deletedAt: "deleted_at",
      indexes: [
        {
          name: "attributes_slug_active_unique",
          unique: true,
          fields: [sequelize.fn("lower", sequelize.col("slug"))],
          where: { deleted_at: null },
        },
      ],
    },
  );

  Attributes.beforeValidate((instance) => {
    const source = instance.slug || instance.title;
    const slug = source ? generateSlug(source) : "";
    instance.slug = slug || null;
  });

  Attributes.associate = function (models) {
    Attributes.hasMany(models.AttributeValues, {
      foreignKey: "attribute_id",
      as: "attributeValues",
    });
  };

  return Attributes;
};