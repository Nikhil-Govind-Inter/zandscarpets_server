const { DataTypes } = require("sequelize");

module.exports = (sequelize) => {
  const Milestones = sequelize.define(
    "milestones",
    {
      id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
        allowNull: false,
      },
      label: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      label_ar: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      value: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      value_ar: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      sort_order: {
        type: DataTypes.SMALLINT,
        defaultValue: 0,
      },
      is_active: {
        type: DataTypes.BOOLEAN,
        defaultValue: true,
      },
      deleted_at: {
        type: DataTypes.DATE,
      },
    },
    {
      tableName: "milestones",
      timestamps: true,
      paranoid: true,
      deletedAt: "deleted_at",
    },
  );

  return Milestones;
};
