const { DataTypes } = require("sequelize");

// One row per piece of content inside a mapping (a text block, an image, a
// video) — never a JSON array/comma list, so items can be reordered, reused
// and edited individually. Holds either `text_content` (rich_text fields) or
// a `media_id` reference (image/video fields); which one is required is
// enforced in the controller against the mapping's field type
// (mappingsController.js), not here.
module.exports = (sequelize) => {
  const DetailItems = sequelize.define(
    "DetailItems",
    {
      id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
      },
      mapping_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },
      text_content: {
        type: DataTypes.TEXT,
        allowNull: true,
      },
      media_id: {
        type: DataTypes.INTEGER,
        allowNull: true,
      },
      sort_order: {
        type: DataTypes.SMALLINT,
        defaultValue: 0,
      },
    },
    {
      tableName: "detail_items",
      timestamps: true,
      indexes: [
        { name: "detail_items_mapping_sort", fields: ["mapping_id", "sort_order"] },
        { name: "detail_items_media_id", fields: ["media_id"] },
      ],
    },
  );

  DetailItems.associate = function (models) {
    DetailItems.belongsTo(models.DetailMappings, {
      foreignKey: "mapping_id",
      as: "mapping",
    });
    DetailItems.belongsTo(models.Media, {
      foreignKey: "media_id",
      as: "media",
    });
    // Cascade: deleting a product-level item removes any variant exclusion
    // that pointed at it.
    DetailItems.hasMany(models.DetailItemExclusions, {
      foreignKey: { name: "item_id", allowNull: false, onDelete: "CASCADE" },
      as: "exclusions",
    });
  };

  return DetailItems;
};
