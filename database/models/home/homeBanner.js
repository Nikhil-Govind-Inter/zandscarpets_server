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
      card_title: {
        type: DataTypes.TEXT,
        allowNull: true,
      },
      card_description: {
        type: DataTypes.TEXT,
        allowNull: true,
      },
      media_type: {
        type: DataTypes.ENUM("image", "video"),
        allowNull: true,
      },
      media_path: {
        type: DataTypes.TEXT,
        allowNull: true,
      },
      media_alt: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      btn_one_text: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      btn_one_link: {
        type: DataTypes.TEXT,
        allowNull: true,
      },
      btn_two_text: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      btn_two_link: {
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
      tableName: "home_banner",
      timestamps: true,
    }
  );

  return HomeBanner;
};
