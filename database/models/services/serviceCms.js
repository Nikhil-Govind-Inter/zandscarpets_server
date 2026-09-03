const { DataTypes } = require("sequelize");

module.exports = (sequelize) => {
  const ServiceCms = sequelize.define(
    "serviceCms",
    {
      id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
      },
      title: {
        type: DataTypes.STRING,
        allowNull: false
      },
      description: {
        type: DataTypes.TEXT,
        allowNull: false
      },
      service_title: {
        type: DataTypes.STRING,
        allowNull: false
      },
      process_steps_title: {
        type: DataTypes.STRING,
        allowNull: false
      },
    },
    {
      tableName: "service_cms",
      timestamps: true,
      paranoid: true,
    },
  );

  return ServiceCms;
};
