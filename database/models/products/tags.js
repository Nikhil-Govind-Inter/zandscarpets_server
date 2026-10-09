const { DataTypes } = require("sequelize");

module.exports = (sequelize) => {
  const Tags = sequelize.define(
    "Tags",
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
      tableName: "tags",
      timestamps: true,
      paranoid: true,
      deletedAt: "deleted_at",
    },
  );

  Tags.associate = function (models) {
    // A TAG should has more products
    Tags.hasMany(models.Products, {
      foreignKey: "tag_id",
      as: "products",
    });
  };

  return Tags;
};
