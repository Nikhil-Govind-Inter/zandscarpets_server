const { DataTypes } = require("sequelize");

module.exports = (sequelize) => {
  const InvestmentBusinessModels = sequelize.define(
    "InvestmentBusinessModels",
    {
      id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true,
      },
      short_form: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      title: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      description: {
        type: DataTypes.TEXT,
        allowNull: true,
      },
      media_path: {
        type: DataTypes.TEXT,
        allowNull: true,
      },
      media_alt: {
        type: DataTypes.TEXT,
        allowNull: true,
      },
      points: {
        type: DataTypes.JSON,
        allowNull: true,
      },
      status: {
        type: DataTypes.BOOLEAN,
        defaultValue: true,
      },
      sort_order: {
        type: DataTypes.SMALLINT,
        defaultValue: 0,
      },
      deletedAt: {
        type: DataTypes.DATE,
      },
    },
    {
      tableName: "investment_business_models",
      timestamps: true,
    }
  );

  return InvestmentBusinessModels;
};
