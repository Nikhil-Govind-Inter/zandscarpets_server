const { DataTypes } = require("sequelize");

module.exports = (sequelize) => {
  const Banners = sequelize.define(
    "Banners",
    {
      id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
      },
      page_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
        unique: true,
      },
      desktop_media_path: {
        type: DataTypes.TEXT,
        allowNull: false,
      },
      mobile_media_path: {
        type: DataTypes.TEXT,
        allowNull: false,
      },
      media_alt: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      title: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      sub_title: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      deleted_at: {
        type: DataTypes.DATE,
      },
    },
    {
      tableName: "banners",
      timestamps: true,
      deletedAt: "deleted_at",
    },
  );

  Banners.associate = (models) => {
    Banners.belongsTo(models.Page, { foreignKey: "page_id", as: "page" });
  };

  return Banners;
};
