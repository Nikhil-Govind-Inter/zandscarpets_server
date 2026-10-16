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
