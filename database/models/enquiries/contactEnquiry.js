const { DataTypes } = require("sequelize");

module.exports = (sequelize) => {
  const ContactEnquiry = sequelize.define(
    "ContactEnquiry",
    {
      id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
      },
      name: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      email: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      phone: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      requirements: {
        type: DataTypes.TEXT,
        allowNull: false,
      },
      file: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      deleted_at: {
        type: DataTypes.DATE,
      },
    },
    {
      tableName: "contact_enquiries",
      timestamps: true,
      paranoid: true,
      deletedAt: "deleted_at",
    },
  );

  return ContactEnquiry;
};
