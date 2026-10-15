const { DataTypes } = require("sequelize");

module.exports = (sequelize) => {
  const CommonMilestones = sequelize.define(
    "CommonMilestones",
    {
      id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
        allowNull: false,
      },
      media_path: {
        type: DataTypes.TEXT,
        allowNull: true,
      },
      media_alt: {
        type: DataTypes.STRING,
        allowNull: true,
      },

      value: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      value_ar: {
        type: DataTypes.STRING,
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
      media_alt_ar: {
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
      show_in_home: {
        type: DataTypes.BOOLEAN,
        defaultValue: true,
      },
      deleted_at: {
        type: DataTypes.DATE,
      },
    },
    {
      tableName: "common_milestones",
      timestamps: true,
      paranoid: true,
      deletedAt: "deleted_at",
    },
  );

  return CommonMilestones;
};
