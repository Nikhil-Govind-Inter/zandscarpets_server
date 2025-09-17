const { DataTypes } = require("sequelize");

module.exports = (sequelize) => {
  const HomeMilestone = sequelize.define(
    "HomeMilestone",
    {
      id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true,
      },
      title: {
        type: DataTypes.STRING,
        allowNull: true,
      },
     value:{
        type: DataTypes.INTEGER,
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
      tableName: "home_milestone",
      timestamps: true,
    }
  );

  return HomeMilestone;
};
