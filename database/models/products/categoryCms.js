const { DataTypes } = require("sequelize");

// Singleton row with the content of the storefront Categories page that is not part of a category
module.exports = (sequelize) => {
  const CategoryCms = sequelize.define(
    "categoryCms",
    {
      id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
      },
      // heading above the category list
      title: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      title_ar: {
        type: DataTypes.STRING,
        allowNull: true,
      },
    },
    {
      tableName: "category_cms",
      timestamps: true,
      paranoid: true,
      deletedAt: "deleted_at",
    },
  );

  return CategoryCms;
};
