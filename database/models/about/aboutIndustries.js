const { DataTypes } = require("sequelize");

module.exports = (sequelize) => {
  const AboutIndustries = sequelize.define(
    "about_industries",
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
        allowNull: false,
      },
      description: {
        type: DataTypes.TEXT,
        allowNull: false,
      },
      description_ar: {
        type: DataTypes.TEXT,
        allowNull: false,
      },
      media_path: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      media_alt: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      media_alt_ar: {
        type: DataTypes.STRING,
        allowNull: false,
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
      tableName: "about_industries",
      timestamps: true,
      paranoid: true,
      deletedAt: "deleted_at",
    },
  );

  return AboutIndustries;
};
