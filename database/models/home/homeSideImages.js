const { DataTypes } = require("sequelize");

module.exports = (sequelize) => {
  const HomeSideImages = sequelize.define(
    "HomeSideImages",
    {
      id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
        allowNull: false,
      },
      before_media_path: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      after_media_path: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      before_media_alt: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      before_media_alt_ar: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      after_media_alt: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      after_media_alt_ar: {
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
      tableName: "home_side_images",
      timestamps: true,
      paranoid: true,
      deletedAt: "deleted_at",
    },
  );
  return HomeSideImages;
};
