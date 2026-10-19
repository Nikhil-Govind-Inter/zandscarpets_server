const { DataTypes } = require("sequelize");

module.exports = (sequelize) => {
  const SampleRequest = sequelize.define(
    "SampleRequest",
    {
      id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
      },
      name: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      phone: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      email: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      company_name: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      // The chosen category / product are kept as a snapshot (id + title) so the request stays
      // readable in the admin even if the catalog entry is renamed or deleted later.
      product_category_id: {
        type: DataTypes.INTEGER,
        allowNull: true,
      },
      category_title: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      product_id: {
        type: DataTypes.INTEGER,
        allowNull: true,
      },
      product_title: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      deleted_at: {
        type: DataTypes.DATE,
      },
    },
    {
      tableName: "sample_requests",
      timestamps: true,
      paranoid: true,
      deletedAt: "deleted_at",
    },
  );

  return SampleRequest;
};
