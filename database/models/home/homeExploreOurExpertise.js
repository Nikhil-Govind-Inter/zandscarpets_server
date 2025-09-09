const { DataTypes } = require("sequelize");

module.exports = (sequelize) => {
  const HomeExploreOurExpertise = sequelize.define(
    "HomeExploreOurExpertise",
    {
      id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true,
      },
      title: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      description: {
        type: DataTypes.TEXT,
        allowNull: true,
      },
      button_text: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      button_text_link: {
        type: DataTypes.TEXT,
        allowNull: true,
      },
      media_path: {
        type: DataTypes.TEXT,
        allowNull: true,
      },
      media_alt: {
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
      tableName: "home_explore_our_expertise",
      timestamps: true,
    }
  );

  return HomeExploreOurExpertise;
};
