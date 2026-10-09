const { DataTypes } = require("sequelize");

module.exports = (sequelize) => {
  const Faqs = sequelize.define(
    "Faqs",
    {
      id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
      },
      question: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      question_ar: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      answer: {
        type: DataTypes.TEXT,
        allowNull: false,
      },
      answer_ar: {
        type: DataTypes.TEXT,
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
      tableName: "faqs",
      timestamps: true,
      paranoid: true,
      deletedAt: "deleted_at",
    },
  );

  return Faqs;
};
