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

      header_logo_media_path:{
        type: DataTypes.STRING,
        allowNull: false,
      },
      footer_logo_media_path:{
        type: DataTypes.STRING,
        allowNull: false,
      },

      address:{
        type: DataTypes.TEXT,
        allowNull: false,
      },

      email:{
        type: DataTypes.STRING,
        allowNull: false,
      },

      phone_number:{
        type: DataTypes.STRING,
        allowNull: false,
      },

      whatsapp_number:{
        type: DataTypes.STRING,
        allowNull: false,
      },

      admin_email:{
        type: DataTypes.STRING,
        allowNull: false,
        defaultValue: "admin@intersmart.in",
      }
    },
    {
      tableName: "site_settings",
      timestamps: true,
paranoid: true,
    },
  );

  return SiteSettings;
};
