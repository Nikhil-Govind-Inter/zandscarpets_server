const { DataTypes } = require("sequelize");

module.exports = (sequelize) => {
  const AppPageCms = sequelize.define(
    "AppPageCms",
    {
      id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
      },
      banner_title: {
        type: DataTypes.TEXT,
        allowNull: true,
      },
      banner_media_desktop_path: {
        type: DataTypes.TEXT,
        allowNull: true,
      },
      banner_media_mobile_path: {
        type: DataTypes.TEXT,
        allowNull: true,
      },
      banner_media_alt: {
        type: DataTypes.TEXT,
        allowNull: true,
      },

      about_description: {
        type: DataTypes.TEXT,
        allowNull: true,
      },

      feature_title: {
        type: DataTypes.TEXT,
        allowNull: true,
      },

      charge_ur_ev_title: {
        type: DataTypes.TEXT,
        allowNull: true,
      },


      start_ur_journey_title: {
        type: DataTypes.TEXT,
        allowNull: true,
      },
      start_ur_journey_media_path: {
        type: DataTypes.TEXT,
        allowNull: true,
      },

      start_ur_journey_media_alt: {
        type: DataTypes.TEXT,
        allowNull: true,
      },
    },
    {
      tableName: "app_page_cms",
      timestamps: true,
    }
  );

  return AppPageCms;
};
