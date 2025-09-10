const { DataTypes } = require("sequelize");

module.exports = (sequelize) => {
  const InvestInGoEcMilestone = sequelize.define(
    "InvestInGoEcMilestone",
    {
      id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true,
      },
      value: {
        type: DataTypes.INTEGER,
        allowNull: true,
      },
      prefix: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      subtitle: {
        type: DataTypes.STRING,
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
      tableName: "investment_in_goec_milestone",
      timestamps: true,
    }
  );

  return InvestInGoEcMilestone;
};
