const { DataTypes } = require("sequelize");

module.exports = (sequelize) => {
  const Projects = sequelize.define(
    "Projects",
    {
      id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
      },
      category_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },
      thumbnail: {
        type: DataTypes.TEXT,
        allowNull: true,
      },
      title: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      location: {
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
      media_path: {
        type: DataTypes.TEXT,
        allowNull: true,
      },
      description: {
        type: DataTypes.TEXT,
        allowNull: true,
      },
      project_media: {
        type: DataTypes.ARRAY(DataTypes.TEXT),
        allowNull: true,
        defaultValue: [],
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
    },
  );

  Projects.associate = function (models) {
    // belongsTo industry (one industry -> many projects)
    Projects.belongsTo(models.Industry, {
      foreignKey: "category_id",
      as: "category",
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
