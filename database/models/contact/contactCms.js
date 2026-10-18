const { DataTypes } = require("sequelize");

module.exports = (sequelize) => {
  const ContactCms = sequelize.define(
    "contactCms",
    {
      id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
        allowNull: false,
      },
      title: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      title_ar: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      description: {
        type: DataTypes.TEXT,
        allowNull: false,
      },
      description_ar: {
        type: DataTypes.TEXT,
        allowNull: false,
      },
      form_title: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      form_title_ar: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      social_media_title: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      social_media_title_ar: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      map_url: {
        type: DataTypes.TEXT,
        allowNull: false,
      },
      // phone / email / office detail cards (icon upload, title, description, value)
      phone_title: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      phone_title_ar: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      phone_description: {
        type: DataTypes.TEXT,
        allowNull: true,
      },
      phone_description_ar: {
        type: DataTypes.TEXT,
        allowNull: true,
      },
      phone_value: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      phone_icon_media_path: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      phone_icon_media_alt: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      phone_icon_media_alt_ar: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      email_title: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      email_title_ar: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      email_description: {
        type: DataTypes.TEXT,
        allowNull: true,
      },
      email_description_ar: {
        type: DataTypes.TEXT,
        allowNull: true,
      },
      email_value: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      email_icon_media_path: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      email_icon_media_alt: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      email_icon_media_alt_ar: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      office_title: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      office_title_ar: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      office_description: {
        type: DataTypes.TEXT,
        allowNull: true,
      },
      office_description_ar: {
        type: DataTypes.TEXT,
        allowNull: true,
      },
      office_value: {
        type: DataTypes.TEXT,
        allowNull: true,
      },
      office_value_ar: {
        type: DataTypes.TEXT,
        allowNull: true,
      },
      office_icon_media_path: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      office_icon_media_alt: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      office_icon_media_alt_ar: {
        type: DataTypes.STRING,
        allowNull: true,
      },
    },
    {
      tableName: "contact_cms",
      timestamps: true,
      paranoid: true,
      deletedAt: "deleted_at",
    },
  );

  return ContactCms;
};
