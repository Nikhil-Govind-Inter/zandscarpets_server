const { DataTypes } = require("sequelize");

module.exports = (sequelize) => {
  const HomeBanner = sequelize.define(
    "HomeBanner",
    {
      id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
        allowNull: false,
      },
      industry_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },
      title: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      description: {
        type: DataTypes.STRING,
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
      tableName: "home_banner",
      timestamps: true,
      paranoid: true,
      deletedAt: "deleted_at",
    },
  );

  HomeBanner.associate = function (models) {
    // hasOne with industry
    HomeBanner.belongsTo(models.Industry, {
      foreignKey: "industry_id",
      as: "industry",
    });
  };

  return HomeBanner;
};
