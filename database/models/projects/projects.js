 const { DataTypes } = require("sequelize");
const { generateSlug } = require("../../../utils/slugHelper");

module.exports = (sequelize) => {
  const Projects = sequelize.define(
    "Projects",
    {
      id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
      },
      industry_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },
      category_id: {
        type: DataTypes.INTEGER,
        allowNull: true,
      },
      thumbnail: {
        type: DataTypes.TEXT,
        allowNull: true,
      },
      title: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      slug: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      title_ar: {
        type: DataTypes.STRING,
        allowNull: false,
        defaultValue: "",
      },
      location: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      location_ar: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      date_of_completion: {
        type: DataTypes.DATE,
        allowNull: true,
      },
      material_type: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      material_type_ar: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      media_path: {
        type: DataTypes.TEXT,
        allowNull: true,
      },
      description: {
        type: DataTypes.TEXT,
        allowNull: true,
      },
      description_ar: {
        type: DataTypes.TEXT,
        allowNull: true,
      },
      is_active: {
        type: DataTypes.BOOLEAN,
        defaultValue: true,
      },
      is_show_in_home: {
        type: DataTypes.BOOLEAN,
        defaultValue: false,
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
      tableName: "projects",
      timestamps: true,
      paranoid: true,
      deletedAt: "deleted_at",
      indexes: [
        {
          name: "projects_slug_active_unique",
          unique: true,
          fields: [sequelize.fn("lower", sequelize.col("slug"))],
          where: { deleted_at: null },
        },
      ],
    },
  );

  // Uniform slug generation: always derive from title (or normalize a given
  // slug) before validation. Titles that cannot be slugified keep slug NULL,
  // which the partial unique index ignores. Mirrors ProductCategories.
  Projects.beforeValidate((instance) => {
    const source = instance.slug || instance.title;
    const slug = source ? generateSlug(source) : "";
    instance.slug = slug || null;
  });

  Projects.associate = function (models) {
    // belongsTo industry (one industry -> many projects)
    Projects.belongsTo(models.Industry, {
      foreignKey: "industry_id",
      as: "industry",
    });

    // belongsTo category (one category, mapped to the project's industry via
    // industry_categories, -> many projects). Optional: not every industry
    // has categories mapped to it.
    Projects.belongsTo(models.ProductCategories, {
      foreignKey: "category_id",
      as: "category",
    });

    // hasMany gallery items (images/videos), ordered by sort_order.
    Projects.hasMany(models.ProjectMedia, {
      foreignKey: "project_id",
      as: "project_media",
    });

    // self-referential many-to-many via a join table, so a project can
    // link out to several other projects as "related projects". Sequelize
    // manages the join table (project_related_projects) automatically since
    // no explicit through-model is registered. Symmetric linking (if wanted)
    // is the caller's responsibility — this association is one-directional
    // per row (project_id -> related_project_id).
    Projects.belongsToMany(models.Projects, {
      through: "project_related_projects",
      as: "relatedProjects",
      foreignKey: "project_id",
      otherKey: "related_project_id",
    });
  };

  return Projects;
};
