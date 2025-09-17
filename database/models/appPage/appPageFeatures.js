const { DataTypes } = require("sequelize");

module.exports = (sequelize) => {
  const AppPageFeatures = sequelize.define(
    "AppPageFeatures",
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
      highlight_title: {
        type: DataTypes.TEXT,
        allowNull: true,
      },
      image_one_path: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      image_two_path: {
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
      tableName: "app_page_features",
      timestamps: true,
    }
  );

  return AppPageFeatures;
};
