const { DataTypes } = require("sequelize");

module.exports = (sequelize) => {
  const HomeCms = sequelize.define(
    "homeCms",
    {
      id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
        allowNull: false,
      },
      discover_title: {
        type: DataTypes.TEXT,
        allowNull: false,
      },
      residential_title: {
        type: DataTypes.TEXT,
        allowNull: false,
      },
      home_space_title: {
        type: DataTypes.TEXT,
        allowNull: false,
      },
      project_title: {
        type: DataTypes.TEXT,
        allowNull: false,
      },
      features_title: {
        type: DataTypes.TEXT,
        allowNull: false,
      },
      features_subtitle: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      features_description: {
        type: DataTypes.TEXT,
        allowNull: false,
      },
      work_title: {
        type: DataTypes.TEXT,
        allowNull: false,
      },
      testimonial_title: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      brand_title: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      cta_title: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      cta_description: {
        type: DataTypes.TEXT,
        allowNull: false,
      },
      faq_title: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      premium_title: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      premium_description: {
        type: DataTypes.TEXT,
        allowNull: false,
      },
    },
    {
      tableName: "home_cms",
      timestamps: true,
paranoid: true,
      deletedAt: "deleted_at",
    },
  );
  return HomeCms;
};
