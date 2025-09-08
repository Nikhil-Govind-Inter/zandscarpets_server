const { DataTypes } = require("sequelize");

module.exports = (sequelize) => {
  const SiteSettings = sequelize.define(
    "SiteSettings",
    {
      id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
      },
      address: {
        type: DataTypes.TEXT,
        allowNull: true,
      },
      email: {
        type: DataTypes.TEXT,
        allowNull: true,
      },
      phone: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      logo: {
        type: DataTypes.TEXT,
        allowNull: true,
      },
      logo_alt: {
        type: DataTypes.STRING,
        allowNull: true,
        defaultValue: "",
      },
      favicon: {
        type: DataTypes.TEXT,
        allowNull: true,
      },
      footer_download_image_one: {
        type: DataTypes.TEXT,
        allowNull: true,
      },
      footer_download_image_one_alt: {
        type: DataTypes.TEXT,
        allowNull: true,
        defaultValue: "",
      },
      footer_download_image_one_link: {
        type: DataTypes.TEXT,
        allowNull: true,
      },
      footer_download_image_two: {
        type: DataTypes.TEXT,
        allowNull: true,
      },
      footer_download_image_two_alt: {
        type: DataTypes.TEXT,
        allowNull: true,
        defaultValue: "",
      },
      footer_download_image_two_link: {
        type: DataTypes.TEXT,
        allowNull: true,
      },
      footer_logo: {
        type: DataTypes.TEXT,
        allowNull: true,
      },
      footer_logo_alt: {
        type: DataTypes.TEXT,
        allowNull: true,
        defaultValue: "",
      },
      footer_description: {
        type: DataTypes.TEXT,
        allowNull: true,
      },
      social_media_title: {
        type: DataTypes.TEXT,
        allowNull: true,
      },
      subscribe_title: {
        type: DataTypes.TEXT,
        allowNull: true,
        defaultValue: "",
      },
    },
    {
      tableName: "site_settings",
      timestamps: true,
      createdAt: "created_at",
      updatedAt: "updated_at",
    }
  );

  return SiteSettings;
};
