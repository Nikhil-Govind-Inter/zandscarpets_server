const { DataTypes } = require("sequelize");

// Singleton row (always findOne()) holding the Common Items > Content copy.
module.exports = (sequelize) => {
  const CommonContent = sequelize.define(
    "CommonContent",
    {
      id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
        allowNull: false,
      },
      why_choose_title: { type: DataTypes.TEXT, allowNull: false },
      why_choose_title_ar: { type: DataTypes.TEXT, allowNull: false },
      side_section_title: { type: DataTypes.TEXT, allowNull: false },
      side_section_title_ar: { type: DataTypes.TEXT, allowNull: false },
      side_section_description: { type: DataTypes.TEXT, allowNull: false },
      side_section_description_ar: { type: DataTypes.TEXT, allowNull: false },
      button_text: { type: DataTypes.STRING, allowNull: false },
      button_text_ar: { type: DataTypes.STRING, allowNull: false },
      button_link: { type: DataTypes.STRING, allowNull: false },
      how_section_title: { type: DataTypes.TEXT, allowNull: false },
      how_section_title_ar: { type: DataTypes.TEXT, allowNull: false },
      // Large faint text behind the how-it-works heading (optional; the storefront falls back to its translation)
      how_section_bg_title: { type: DataTypes.STRING, allowNull: true },
      how_section_bg_title_ar: { type: DataTypes.STRING, allowNull: true },
      how_section_media_type: {
        type: DataTypes.ENUM("image", "video"),
        allowNull: false,
        defaultValue: "image",
      },
      how_section_media_path: { type: DataTypes.STRING, allowNull: true },
      // Poster image for video media; null for images.
      how_section_thumbnail: { type: DataTypes.STRING, allowNull: true },
    },
    {
      tableName: "common_content",
      timestamps: true,
      paranoid: true,
      deletedAt: "deleted_at",
    },
  );

  return CommonContent;
};
