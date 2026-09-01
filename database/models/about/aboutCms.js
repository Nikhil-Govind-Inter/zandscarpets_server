const { DataTypes } = require("sequelize");

module.exports = (sequelize) => {
  const AboutCms = sequelize.define(
    "aboutCms",
    {
      id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
        allowNull: false,
      },
      about_title: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      about_description: {
        type: DataTypes.TEXT,
        allowNull: false,
      },
      media_path: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      media_alt: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      trust_title: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      trust_description: {
        type: DataTypes.TEXT,
        allowNull: false,
      },
      mission_title: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      vision_title: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      mission_description: {
        type: DataTypes.TEXT,
        allowNull: false,
      },
      vision_description: {
        type: DataTypes.TEXT,
        allowNull: false,
      },
      history_title: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      message_title: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      message_subtitle: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      work_title: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      about_core_title: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      about_code_media_path: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      about_code_media_alt: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      features_title: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      features_sub_title: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      features_description: {
        type: DataTypes.TEXT,
        allowNull: false,
      },
      industry_title: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      industry_description: {
        type: DataTypes.TEXT,
        allowNull: false,
      },
      industry_media_path: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      industry_media_alt: {
        type: DataTypes.STRING,
        allowNull: true,
      },
    },
    {
      tableName: "about_cms",
      timestamps: true,
      paranoid: true,
      deletedAt: "deleted_at",
    },
  );

  return AboutCms;
};
