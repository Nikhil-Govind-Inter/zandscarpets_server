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

    },
    {
      tableName: "site_settings",
      timestamps: true,
    },
  );

  return SiteSettings;
};
