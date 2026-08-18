const { DataTypes } = require("sequelize");

module.exports = (sequelize) => {
  const Page = sequelize.define(
    "Page",
    {
      id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
      },
      page: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      page_slug: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: true,
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
      tableName: "pages",
      timestamps: true,
      deletedAt: "deleted_at",
    },
  );

  Page.associate = (models) => {
    Page.hasOne(models.Banners, { foreignKey: "page_id", as: "banner" });
    Page.hasOne(models.MetaData, { foreignKey: "page_id", as: "metaData" });
  };

  return Page;
};
