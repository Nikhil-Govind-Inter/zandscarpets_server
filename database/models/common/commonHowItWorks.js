const { DataTypes } = require("sequelize");

module.exports = (sequelize) => {
  const CommonHowItWorks = sequelize.define(
    "CommonHowItWorks",
    {
      id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
        allowNull: false,
      },
      title: { type: DataTypes.STRING, allowNull: false },
      title_ar: { type: DataTypes.STRING, allowNull: false },
      description: { type: DataTypes.TEXT, allowNull: false },
      description_ar: { type: DataTypes.TEXT, allowNull: false },
      sort_order: { type: DataTypes.SMALLINT, defaultValue: 0 },
      is_active: { type: DataTypes.BOOLEAN, defaultValue: true },
      deleted_at: { type: DataTypes.DATE },
    },
    {
      tableName: "common_how_it_works",
      timestamps: true,
      paranoid: true,
      deletedAt: "deleted_at",
    },
  );

  return CommonHowItWorks;
};
