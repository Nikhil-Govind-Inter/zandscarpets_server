const { DataTypes } = require("sequelize");

module.exports = (sequelize) => {
  const ProductFaq = sequelize.define(
    "ProductFaq",
    {
      id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
      },
      product_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },
      question: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      question_ar: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      answer: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      answer_ar: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      is_active: {
        type: DataTypes.BOOLEAN,
        defaultValue: true,
      },
      sort_order: {
        type: DataTypes.SMALLINT,
        defaultValue: 0,
      },
      deleted_at: {
        type: DataTypes.DATE,
      },
    },
    {
      tableName: "product_faqs",
      timestamps: true,
      paranoid: true,
      deletedAt: "deleted_at",
    },
  );


  // relation with prod
  ProductFaq.associate = (models) => {
    ProductFaq.belongsTo(models.Products, {
      foreignKey: "product_id",
      as: "product",
    });
  }

  return ProductFaq;
};
