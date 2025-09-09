const { DataTypes } = require("sequelize");

module.exports = (sequelize) => {
  const HomeBanner = sequelize.define(
    "HomeBanner",
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
      description: {
        type: DataTypes.TEXT,
        allowNull: true,
      },
      button_text_one: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      button_text_one_link: {
        type: DataTypes.TEXT,
        allowNull: true,
      },
      button_text_two: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      button_text_two_link: {
        type: DataTypes.TEXT,
        allowNull: true,
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
      tableName: "home_banner",
      timestamps: true,
    }
  );

  return HomeBanner;
};
