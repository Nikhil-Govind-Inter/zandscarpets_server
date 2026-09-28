const { DataTypes } = require("sequelize");

module.exports = (sequelize) => {
  const Size = sequelize.define(
    "Size",
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
      tableName: "size",
      timestamps: true,
      paranoid: true,
      deletedAt: "deleted_at",
    },
  );

    // many to many with PRODUCRS
    Size.associate = function (models) {
      Size.belongsToMany(models.Products, {
        through: "size_products",
        foreignKey: "size_id",
        otherKey: "product_id",
        as: "products",
      });
    }
  return Size;
};
