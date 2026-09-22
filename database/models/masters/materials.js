const { DataTypes } = require("sequelize");

module.exports = (sequelize) => {
  const Materials = sequelize.define(
    "Materials",
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
      tableName: "materials",
      timestamps: true,
      paranoid: true,
      deletedAt: "deleted_at",
    },
  );

  Materials.associate = function (models) {
    // one material -> many projects
    Materials.hasMany(models.Projects, {
      foreignKey: "material_id",
      as: "projects",
    });
  };

  return Materials;
};
