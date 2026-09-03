const { DataTypes } = require("sequelize");

module.exports = (sequelize) => {
  const ProcessSteps = sequelize.define(
    "processSteps",
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
      description: {
        type: DataTypes.TEXT,
        allowNull: false,
      },
      media_path:{
        type: DataTypes.TEXT,
        allowNull: true
      },
      media_alt:{
        type: DataTypes.STRING,
        allowNull: true

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
      tableName: "process_steps",
      timestamps: true,
      paranoid: true,
      deletedAt: "deleted_at",
    },
  );

  return ProcessSteps;
};
