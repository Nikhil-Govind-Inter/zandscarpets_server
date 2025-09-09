const { DataTypes } = require("sequelize");

module.exports = (sequelize) => {
  const InvestmentTestimonials = sequelize.define(
    "InvestmentTestimonials",
    {
      id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true,
      },  
      profile_media_path: {
        type: DataTypes.TEXT,
        allowNull: true,
      },
      profile_media_alt: {
        type: DataTypes.TEXT,
        allowNull: true,
      },
      name: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      designation: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      description: {
        type: DataTypes.TEXT,
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
      tableName: "investment_testimonials",
      timestamps: true,
    }
  );

  return InvestmentTestimonials;
};
