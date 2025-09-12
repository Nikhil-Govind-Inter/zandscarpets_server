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

      key_benefit_title: {
        type: DataTypes.TEXT,
        allowNull: true,
      },

      card_apply_step_title: {
        type: DataTypes.TEXT,
        allowNull: true,
      },
      card_apply_step_description: {
        type: DataTypes.TEXT,
        allowNull: true,
      },


      get_ur_ev_title: {
        type: DataTypes.TEXT,
        allowNull: true,
      },

    
    },
    {
      tableName: "go_ec_smart_card_cms",
      timestamps: true,
    }
  );

  return GoEcSmartCardCms;
};
