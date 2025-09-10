const { DataTypes } = require("sequelize");

module.exports = (sequelize) => {
  const HomeCms = sequelize.define(
    "HomeCms",
    {
      id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
      },
      milestone_description: {
        type: DataTypes.TEXT,
        allowNull: true,
      },

      make_ride_title: {
        type: DataTypes.TEXT,
        allowNull: true,
      },
       make_ride_highlight_title: {
        type: DataTypes.TEXT,
        allowNull: true,
      },
      make_ride_description: {
        type: DataTypes.TEXT,
        allowNull: true,
      },
      make_ride_media_type: {
        type: DataTypes.ENUM("image", "video"),
        allowNull: true,
      },
      make_ride_media_desktop_path: {
        type: DataTypes.TEXT,
        allowNull: true,
      },
      make_ride_media_mobile_path: {
        type: DataTypes.TEXT,
        allowNull: true,
      },
      make_ride_media_alt: {
        type: DataTypes.TEXT,
        allowNull: true,
      },

      explore_title: {
        type: DataTypes.TEXT,
        allowNull: true,
      },

      explore_description: {
        type: DataTypes.TEXT,
        allowNull: true,
      },

      app_feature_title: {
        type: DataTypes.TEXT,
        allowNull: true,
      },
      app_feature_description: {
        type: DataTypes.TEXT,
        allowNull: true,
      },
      app_feature_sub_title: {
        type: DataTypes.TEXT,
        allowNull: true,
      },
      
      app_feature_media_type: {
        type: DataTypes.ENUM("image", "video"),
        allowNull: true,
      },
      app_feature_media_desktop_path: {
        type: DataTypes.TEXT,
        allowNull: true,
      },
      app_feature_media_mobile_path: {
        type: DataTypes.TEXT,
        allowNull: true,
      },
      app_feature_media_alt: {
        type: DataTypes.TEXT,
        allowNull: true,
      },

      investment_title: {
        type: DataTypes.TEXT,
        allowNull: true,
      },
      investment_media_type: {
        type: DataTypes.ENUM("image", "video"),
        allowNull: true,
      },
      investment_media_desktop_path: {
        type: DataTypes.TEXT,
        allowNull: true,
      },
      investment_media_mobile_path: {
        type: DataTypes.TEXT,
        allowNull: true,
      },
      investment_media_alt: {
        type: DataTypes.TEXT,
        allowNull: true,
      },
      partners_title: {
        type: DataTypes.TEXT,
        allowNull: true,
      },
      news_title: {
        type: DataTypes.TEXT,
        allowNull: true,
      },
      blog_title: {
        type: DataTypes.TEXT,
        allowNull: true,
      },

    },
    {
      tableName: "home_cms",
      timestamps: true,
    }
  );

  return HomeCms;
};
