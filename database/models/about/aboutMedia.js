const { DataTypes } = require("sequelize");

module.exports = (sequelize) => {
  const AboutMedia = sequelize.define(
    "AboutMedia",
    {
      id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true,
      },
      media_type: {
        type: DataTypes.ENUM("image", "video"),
        allowNull: true,
      },
      media_desktop_path: {
        type: DataTypes.TEXT,
        allowNull: true,
      },
      media_mobile_path: {
        type: DataTypes.TEXT,
        allowNull: true,
      },
      media_alt: {
        type: DataTypes.TEXT,
        allowNull: true,
      },
       thumbnail: {
        type: DataTypes.TEXT,
        allowNull: true,
      },
      thumbnail_alt: {
        type: DataTypes.TEXT,
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
      tableName: "about_media",
      timestamps: true,
    }
  );

  return AboutMedia;
};
