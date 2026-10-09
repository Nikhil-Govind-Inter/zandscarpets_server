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
      title_ar: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      description: {
        type: DataTypes.TEXT,
        allowNull: true,
      },
      description_ar: {
        type: DataTypes.TEXT,
        allowNull: true,
      },
      content: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      content_ar: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      icon_media_path: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      icon_media_alt: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      icon_media_alt_ar: {
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
