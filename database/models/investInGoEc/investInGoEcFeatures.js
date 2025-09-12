const { DataTypes } = require("sequelize");

module.exports = (sequelize) => {
  const InvestInGoEcFeatures = sequelize.define(
    "InvestInGoEcFeatures",
    {
      id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true,
      },
      icon_path: {
        type: DataTypes.TEXT,
        allowNull: true,
      },
      icon_alt: {
        type: DataTypes.TEXT,
        allowNull: true,
      },
      description: {
        type: DataTypes.TEXT,
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
      tableName: "invest_in_goec_features",
      timestamps: true,
    }
  );

  return InvestInGoEcFeatures;
};
