const { DataTypes } = require("sequelize");

module.exports = (sequelize) => {
  const ProjectMedia = sequelize.define(
    "ProjectMedia",
    {
      id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
      },
      project_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },
      media_type: {
        type: DataTypes.ENUM,
        allowNull: false,
        values: ["image", "video"],
      },
      media_path: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      thumbnail: {
        type: DataTypes.STRING,
        allowNull: true,
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
      tableName: "project_media_items",
      timestamps: true,
      paranoid: true,
      deletedAt: "deleted_at",
    },
  );

  ProjectMedia.associate = function (models) {
    ProjectMedia.belongsTo(models.Projects, {
      foreignKey: "project_id",
      as: "project",
    });
  };

  return ProjectMedia;
};
