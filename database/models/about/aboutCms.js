const { DataTypes } = require("sequelize");

module.exports = (sequelize) => {
  const AboutCms = sequelize.define(
    "AboutCms",
    {
      id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
      },
      banner_title: {
        type: DataTypes.STRING,
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
      about_media_type: {
        type: DataTypes.ENUM("image", "video"),
        allowNull: true,
      },
      about_media_desktop_path: {
        type: DataTypes.TEXT,
        allowNull: true,
      },
      about_media_mobile_path: {
        type: DataTypes.TEXT,
        allowNull: true,
      },
      about_media_alt: {
        type: DataTypes.TEXT,
        allowNull: true,
      },
      learn_more_title: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      learn_more_description: {
        type: DataTypes.TEXT,
        allowNull: true,
      },

      learn_more_media_path: {
        type: DataTypes.TEXT,
        allowNull: true,
      },

      learn_more_media_alt: {
        type: DataTypes.TEXT,
        allowNull: true,
      },
      our_mission_title: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      our_mission_description: {
        type: DataTypes.TEXT,
        allowNull: true,
      },
      our_vision_title: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      our_vision_description: {
        type: DataTypes.TEXT,
        allowNull: true,
      },
      leading_game_title: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      charging_station_count: {
        type: DataTypes.INTEGER,
        allowNull: true,
      },
      charging_station_subtitle: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      our_values_title: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      our_values_description: {
        type: DataTypes.TEXT,
        allowNull: true,
      },
      our_journey_title: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      our_journey_description: {
        type: DataTypes.TEXT,
        allowNull: true,
      },
      meet_team_title: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      meet_team_description: {
        type: DataTypes.TEXT,
        allowNull: true,
      },
      meet_team_media_path: {
        type: DataTypes.TEXT,
        allowNull: true,
      },
      meet_team_media_alt: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      our_associate_title: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      our_associate_description: {
        type: DataTypes.TEXT,
        allowNull: true,
      },
      media_title: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      media_description: {
        type: DataTypes.TEXT,
        allowNull: true,
      },
      contact_us_super_title: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      contact_us_title: {
        type: DataTypes.STRING,
        allowNull: true,
      },
    },
    {
      tableName: "about_cms",
      timestamps: true,
    }
  );

  return AboutCms;
};
