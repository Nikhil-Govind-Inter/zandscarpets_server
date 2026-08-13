const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  const AdminRefreshToken = sequelize.define(
    'AdminRefreshToken',
    {
      id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
      },
      userId: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },
      tokenHash: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      expiresAt: {
        type: DataTypes.DATE,
        allowNull: false,
      },
      revokedAt: {
        type: DataTypes.DATE,
        allowNull: true,
      },
      replacedByTokenId: {
        type: DataTypes.INTEGER,
        allowNull: true,
      },
    },
    {
      tableName: 'admin_refresh_tokens',
    }
  );

  AdminRefreshToken.associate = (models) => {
    AdminRefreshToken.belongsTo(models.AdminUser, { foreignKey: 'userId' });
  };

  return AdminRefreshToken;
};
