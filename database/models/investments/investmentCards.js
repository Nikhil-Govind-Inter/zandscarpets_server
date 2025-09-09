const { DataTypes } = require("sequelize");

module.exports = (sequelize) => {
  const InvestmentCards = sequelize.define(
    "InvestmentCards",
    {
      id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true,
      },
      icon: {
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
      tableName: "investment_cards",
      timestamps: true,
    }
  );

  return InvestmentCards;
};
