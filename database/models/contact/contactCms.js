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
      }
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
