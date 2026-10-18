const { DataTypes } = require("sequelize");
const { generateSlug } = require("../../../utils/slugHelper");

// Master list of content-block types (Description, Installation Guide,
// Gallery, Demo Videos, ...) that can be mapped onto a product or a variant.
// `type` must not change once any mapping of this field has items, and a
// field cannot be deleted while any mapping references it — both enforced in
// the controller (detailFieldsController.js), not here: Sequelize's
// `sync({ alter: true })` has no declarative way to express "no rows
// elsewhere reference this row" as a DB constraint.
module.exports = (sequelize) => {
  const DetailFields = sequelize.define(
    "DetailFields",
    {
      id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
      },
      name: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      name_ar: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      slug: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      type: {
        type: DataTypes.ENUM,
        values: ["rich_text", "image", "video"],
        allowNull: false,
      },
      allows_multiple: {
        type: DataTypes.BOOLEAN,
        defaultValue: false,
      },
      sort_order: {
        type: DataTypes.SMALLINT,
        defaultValue: 0,
      },
      is_active: {
        type: DataTypes.BOOLEAN,
        defaultValue: true,
      },
      deleted_at: {
        type: DataTypes.DATE,
      },
    },
    {
      tableName: "detail_fields",
      timestamps: true,
      paranoid: true,
      deletedAt: "deleted_at",
      indexes: [
        {
          name: "detail_fields_slug_unique",
          unique: true,
          fields: [sequelize.fn("lower", sequelize.col("slug"))],
          where: { deleted_at: null },
        },
      ],
    },
  );

  DetailFields.beforeValidate((instance) => {
    const source = instance.slug || instance.name;
    const slug = source ? generateSlug(source) : "";
    instance.slug = slug || null;
  });

  DetailFields.associate = function (models) {
    DetailFields.hasMany(models.DetailMappings, {
      foreignKey: "field_id",
      as: "mappings",
    });
  };

  return DetailFields;
};
