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
      make_ride_description: {
        type: DataTypes.TEXT,
        allowNull: true,
      },
      make_ride_media_type: {
        type: DataTypes.TEXT,
        allowNull: true,
      },
      make_ride_desktop_media: {
        type: DataTypes.TEXT,
        allowNull: true,
      },
      make_ride_mobile_media: {
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
      apple_store_image: {
        type: DataTypes.TEXT,
        allowNull: true,
      },
      apple_store_image_alt: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      play_store_image: {
        type: DataTypes.TEXT,
        allowNull: true,
      },
      play_store_img_alt: {
        type: DataTypes.TEXT,
        allowNull: true,
      },
      app_feature_media_type: {
        type: DataTypes.TEXT,
        allowNull: true,
      },
      app_feature_desktop_media: {
        type: DataTypes.TEXT,
        allowNull: true,
      },
      app_feature_mobile_media: {
        type: DataTypes.TEXT,
        allowNull: true,
      },
      app_feature_media_alt: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      
       investment_title: {
        type: DataTypes.STRING,
        allowNull: true,
      },
       investment_media_type: {
        type: DataTypes.STRING,
        allowNull: true,
      },
       investment_desktop_media: {
        type: DataTypes.STRING,
        allowNull: true,
      },
       investment_mobile_media: {
        type: DataTypes.STRING,
        allowNull: true,
      },
       investment_media_alt: {
        type: DataTypes.STRING,
        allowNull: true,
      },
         partners_title: {
        type: DataTypes.STRING,
        allowNull: true,
      },
         news_title: {
        type: DataTypes.STRING,
        allowNull: true,
      },
       blog_title: {
        type: DataTypes.STRING,
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
