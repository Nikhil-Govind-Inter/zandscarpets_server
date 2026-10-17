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
      page_ar: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      page_slug: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: true,
      },
      link: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      show_in_nav: {
        type: DataTypes.BOOLEAN,
        defaultValue: false,
      },
      show_in_footer: {
        type: DataTypes.BOOLEAN,
        defaultValue: false,
      },
      sort_order: {
        type: DataTypes.INTEGER,
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
      tableName: "pages",
      timestamps: true,
      deletedAt: "deleted_at",
    },
  );

  Page.associate = (models) => {
    Page.hasOne(models.Banners, { foreignKey: "page_id", as: "banner" });
  };

  return Page;
};
