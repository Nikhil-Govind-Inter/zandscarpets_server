const { DataTypes } = require("sequelize");

module.exports = (sequelize) => {
  const AdsBanner = sequelize.define(
    "AdsBanner",
    {
      id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
      },
      media_path: {
        type: DataTypes.TEXT,
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
      tableName: "ads_banner",
      timestamps: true,
paranoid: true,
      deletedAt: "deleted_at",
    },
  );

  return AdsBanner;
};
