const { DataTypes } = require("sequelize");

module.exports = (sequelize) => {
  const HomeCms = sequelize.define(
    "homeCms",
    {
      id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
        allowNull: false,
      },
      discover_title: {
        type: DataTypes.TEXT,
        allowNull: false,
      },
      discover_title_ar: {
        type: DataTypes.TEXT,
        allowNull: false,
      },
      residential_title: {
        type: DataTypes.TEXT,
        allowNull: false,
      },
      residential_title_ar: {
        type: DataTypes.TEXT,
        allowNull: false,
      },
      project_title: {
        type: DataTypes.TEXT,
        allowNull: false,
      },
      project_title_ar: {
        type: DataTypes.TEXT,
        allowNull: false,
      },
      testimonial_title: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      testimonial_title_ar: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      brand_title: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      brand_title_ar: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      cta_title: {
        type: DataTypes.TEXT,
        allowNull: false,
      },
      cta_title_ar: {
        type: DataTypes.TEXT,
        allowNull: false,
      },
      cta_media_path: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      cta_description: {
        type: DataTypes.TEXT,
        allowNull: false,
      },
      cta_description_ar: {
        type: DataTypes.TEXT,
        allowNull: false,
      },
      faq_title: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      faq_title_ar: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      premium_title: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      premium_title_ar: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      premium_description: {
        type: DataTypes.TEXT,
        allowNull: false,
      },
      premium_description_ar: {
        type: DataTypes.TEXT,
        allowNull: false,
      },
      space_section_title: {
        type: DataTypes.STRING,
        allowNull: false,
        defaultValue: "",
      },
      space_section_title_ar: {
        type: DataTypes.STRING,
        allowNull: false,
        defaultValue: "",
      },
      // optional button drawn next to the "Built for Every Space" title; shown only when a link is set
      space_button_text: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      space_button_text_ar: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      space_button_link: {
        type: DataTypes.STRING,
        allowNull: true,
      },
    },
    {
      tableName: "home_cms",
      timestamps: true,
      paranoid: true,
      deletedAt: "deleted_at",
    },
  );
  return HomeCms;
};
