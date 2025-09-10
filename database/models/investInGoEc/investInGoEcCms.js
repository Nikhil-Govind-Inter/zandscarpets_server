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
        type: DataTypes.STRING,
        allowNull: true,
      },
      invest_media_path: {
        type: DataTypes.TEXT,
        allowNull: true,
      },
      invest_media_alt: {
        type: DataTypes.TEXT,
        allowNull: true,
      },
      invest_description: {
        type: DataTypes.TEXT,
        allowNull: true,
      },

      future_transportation_title: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      future_transportation_description: {
        type: DataTypes.TEXT,
        allowNull: true,
      },
      future_transportation_media_path: {
        type: DataTypes.TEXT,
        allowNull: true,
      },
      future_transportation_media_alt: {
        type: DataTypes.TEXT,
        allowNull: true,
      },

      business_model_title: {
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
      why_invest_media_path: {
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
