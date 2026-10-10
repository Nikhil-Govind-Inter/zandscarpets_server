const { DataTypes } = require("sequelize");
const { generateSlug } = require("../../../utils/slugHelper");

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
      paranoid: true,
      deletedAt: "deleted_at",
      indexes: [
        {
          name: "industry_slug_active_unique",
          unique: true,
          fields: [sequelize.fn("lower", sequelize.col("slug"))],
          where: { deleted_at: null },
        },
      ],
    },
  );

  industry.beforeValidate((instance) => {
    const source = instance.slug || instance.title;
    if (source) instance.slug = generateSlug(source);
  });

  industry.associate = function (models) {
    // hasMany with homeBanner
    industry.hasOne(models.HomeBanner, {
      foreignKey: "industry_id",
      as: "homeBanner",
    });

    // hasmany with prod categry
    industry.hasMany(models.ProductCategories, {
      foreignKey: "industry_id",
      as: "productCategories",
    });

    // hasMany with projects (one industry/category -> many projects)
    industry.hasMany(models.Projects, {
      foreignKey: "category_id",
      as: "projects",
    });
  };

  return industry;
};
