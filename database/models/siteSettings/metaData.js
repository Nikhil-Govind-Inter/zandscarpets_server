const { DataTypes } = require("sequelize");

module.exports = (sequelize) => {
  const MetaData = sequelize.define(
    "MetaData",
    {
      id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
      },
      page: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      meta_title: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      meta_description: {
        type: DataTypes.TEXT,
        allowNull: false,
      },
      meta_keywords: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      other_meta: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      deleted_at: {
        type: DataTypes.DATE,
      },
    },
    {
      tableName: "meta_data",
      timestamps: true,
      deletedAt: "deleted_at",
    },
  );

  return MetaData;
};
