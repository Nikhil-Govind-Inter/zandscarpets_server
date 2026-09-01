const { DataTypes } = require("sequelize");

module.exports = (sequelize) => {
  const CoreValues = sequelize.define(
    "coreValues",
    {
      id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
        allowNull: false,
      },
      media_path: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      media_alt: {
        type: DataTypes.STRING,
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
      tableName: "core_values",
      timestamps: true,
      paranoid: true,
      deletedAt: "deleted_at",
    },
  );

  return CoreValues;
};
