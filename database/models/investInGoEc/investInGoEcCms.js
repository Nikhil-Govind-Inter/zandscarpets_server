const { DataTypes } = require("sequelize");

module.exports = (sequelize) => {
  const InvestInGoEcCms = sequelize.define(
    "InvestInGoEcCms",
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


      growth_title: {
        type: DataTypes.TEXT,
        allowNull: true,
      },
      growth_description: {
        type: DataTypes.TEXT,
        allowNull: true,
      },
      growth_media_desktop_path: {
        type: DataTypes.TEXT,
        allowNull: true,
      },
      growth_media_mobile_path: {
        type: DataTypes.TEXT,
        allowNull: true,
      },
      growth_media_alt: {
        type: DataTypes.TEXT,
        allowNull: true,
      },

      explore_title: {
        type: DataTypes.STRING,
        allowNull: true,
      },


      why_invest_title: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      why_invest_description: {
        type: DataTypes.TEXT,
        allowNull: true,
      },
      why_invest_media_desktop_path: {
        type: DataTypes.TEXT,
        allowNull: true,
      },
      why_invest_media_mobile_path: {
        type: DataTypes.TEXT,
        allowNull: true,
      },
      why_invest_media_alt: {
        type: DataTypes.TEXT,
        allowNull: true,
      },

      partners_title: {
        type: DataTypes.STRING,
        allowNull: true,
      },

      
      invest_in_goec_title: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      invest_in_goec_media_path: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      invest_in_goec_media_alt: {
        type: DataTypes.STRING,
        allowNull: true,
      },
    },
    {
      tableName: "invest_in_go_ec_cms",
      timestamps: true,
    }
  );

  return InvestInGoEcCms;
};
