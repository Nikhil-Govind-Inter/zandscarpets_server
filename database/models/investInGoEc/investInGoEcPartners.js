const { DataTypes } = require("sequelize");

module.exports = (sequelize) => {
  const InvestInGoEcPartners = sequelize.define(
    "InvestInGoEcPartners",
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
      tableName: "invest_in_goec_partners",
      timestamps: true,
    }
  );

  return InvestInGoEcPartners;
};
