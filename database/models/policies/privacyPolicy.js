const { DataTypes } = require("sequelize");

module.exports = (sequelize) => {
  const PrivacyPolicy = sequelize.define(
    "privacyPolicy",
    {
      id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
        allowNull: false,
      },
      title: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      title_ar: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      content: {
        type: DataTypes.TEXT,
        allowNull: false,
      },
      content_ar: {
        type: DataTypes.TEXT,
        allowNull: false,
      },
    },
    {
      tableName: "privacy_policy",
      timestamps: true,
      paranoid: true,
      deletedAt: "deleted_at",
    },
  );

  return PrivacyPolicy;
};
