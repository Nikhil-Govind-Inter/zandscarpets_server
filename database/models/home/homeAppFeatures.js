const { DataTypes } = require("sequelize");

module.exports = (sequelize) => {
  const HomeAppFeatures = sequelize.define(
    "HomeAppFeatures",
    {
      id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true,
      },
      title:{
        type: DataTypes.STRING,
        allowNull: true,
      },
      icon: {
        type: DataTypes.TEXT,
        allowNull: true,
      },
      icon_alt: {
        type: DataTypes.STRING,
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
      tableName: "home_app_features",
      timestamps: true,
    }
  );

  return HomeAppFeatures;
};
