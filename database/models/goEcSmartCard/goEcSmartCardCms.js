const { DataTypes } = require("sequelize");

module.exports = (sequelize) => {
  const GoEcSmartCardCms = sequelize.define(
    "GoEcSmartCardCms",
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

      key_benefits_title: {
        type: DataTypes.STRING,
        allowNull: true,
      },

      card_apply_steps_title: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      card_apply_steps_description: {
        type: DataTypes.TEXT,
        allowNull: true,
      },


      get_your_ev_title: {
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
