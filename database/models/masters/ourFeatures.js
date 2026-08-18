const { DataTypes } = require("sequelize");

module.exports = (sequelize) => {
  const OurFeatures = sequelize.define(
    "OurFeatures",
    {
      id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
      },
      title: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      description: {
        type: DataTypes.TEXT,
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
      tableName: "our_features",
      timestamps: true,
      deletedAt: "deleted_at",
    },
  );

  return OurFeatures;
};
