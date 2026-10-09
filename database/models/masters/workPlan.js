const { DataTypes } = require("sequelize");

module.exports = (sequelize) => {
  const WorkPlan = sequelize.define(
    "WorkPlan",
    {
      id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
      },
      title: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      title_ar: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      short_description: {
        type: DataTypes.TEXT,
        allowNull: false,
      },
      short_description_ar: {
        type: DataTypes.TEXT,
        allowNull: true,
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
      tableName: "work_plan",
      timestamps: true,
      paranoid: true,
      deletedAt: "deleted_at",
    },
  );

  return WorkPlan;
};
