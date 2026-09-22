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
      title_ar: {
        type: DataTypes.STRING,
        allowNull: true
      },
      description: {
        type: DataTypes.TEXT,
        allowNull: false
      },
      description_ar: {
        type: DataTypes.TEXT,
        allowNull: true
      },
      service_title: {
        type: DataTypes.STRING,
        allowNull: false
      },
      service_title_ar: {
        type: DataTypes.STRING,
        allowNull: true
      },
      process_steps_title: {
        type: DataTypes.STRING,
        allowNull: false
      },
      process_steps_title_ar: {
        type: DataTypes.STRING,
        allowNull: true
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
