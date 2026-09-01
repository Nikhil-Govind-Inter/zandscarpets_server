const { DataTypes } = require("sequelize");

module.exports = (sequelize) => {
  const Connections = sequelize.define(
    "connections",
    {
      id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
        allowNull: false,
      },
      title: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      description: {
        type: DataTypes.TEXT,
        allowNull: false,
      },
      content: {
        type: DataTypes.TEXT,
        allowNull: false,
      },
      icon_media_path: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      icon_media_alt: {
        type: DataTypes.STRING,
        allowNull: true,
      },
    },
    {
      tableName: "connections",
      timestamps: true,
      paranoid: true,
      deletedAt: "deleted_at",
    },
  );

  return Connections;
};
