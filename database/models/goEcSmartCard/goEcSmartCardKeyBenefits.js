const { DataTypes } = require("sequelize");

module.exports = (sequelize) => {
  const GoEcSmartCardKeyBenefits = sequelize.define(
    "GoEcSmartCardKeyBenefits",
    {
      id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true,
      },
      title: {
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
      tableName: "go_ec_smart_card_key_benefits",
      timestamps: true,
    }
  );

  return GoEcSmartCardKeyBenefits;
};
