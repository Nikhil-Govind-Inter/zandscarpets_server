const { DataTypes } = require("sequelize");

module.exports = (sequelize) => {
  const industry = sequelize.define(
    "industry",
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
      title_ar: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      slug: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: true,
      },
      description: {
        type: DataTypes.TEXT,
        allowNull: false,
      },
      description_ar: {
        type: DataTypes.TEXT,
        allowNull: true,
      },
      link: {
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
      tableName: "industry",
      timestamps: true,
      deletedAt: "deleted_at",
    },
  );

  industry.associate = function (models) {
    // hasMany with homeBanner
    industry.hasOne(models.HomeBanner, {
      foreignKey: "industry_id",
      as: "homeBanner",
    });

    // hasMany with projects (one industry/category -> many projects)
    industry.hasMany(models.Projects, {
      foreignKey: "category_id",
      as: "projects",
    });
  };

  return industry;
};
