const { DataTypes } = require("sequelize");

module.exports = (sequelize) => {
  const HomeBrands = sequelize.define(
    "HomeBrands",
    {
      id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
        allowNull: false,
      },
      media_path: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      media_alt: {
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
      },
    },
    {
      tableName: "home_brands",
      timestamps: true,
      paranoid: true,
      deletedAt: "deleted_at",
    },
  );
  return HomeBrands;
};
