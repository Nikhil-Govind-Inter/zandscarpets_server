const { DataTypes } = require("sequelize");

module.exports = (sequelize) => {
  const Colors = sequelize.define(
    "Colors",
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
      media_path: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      media_alt: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      media_alt_ar: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      slug: {
        type: DataTypes.STRING,
        allowNull: true,
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
      tableName: "colors",
      timestamps: true,
      paranoid: true,
      deletedAt: "deleted_at",
    },
  );

  Colors.associate = function (models) {
    Colors.belongsToMany(models.Products, {
      through: "product_color_map",
      foreignKey: "color_id",
      otherKey: "product_id",
      as: "products",
    });
  };
  return Colors;
};
