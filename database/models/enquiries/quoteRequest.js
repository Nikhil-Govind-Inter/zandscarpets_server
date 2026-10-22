const { DataTypes } = require("sequelize");

module.exports = (sequelize) => {
  const QuoteRequest = sequelize.define(
    "QuoteRequest",
    {
      id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
      },
      // Assigned right after create, once the row's id is known (see
      // utils/quoteCodeHelper.js). Format: ZSC-INQ-<id>.
      reference_code: {
        type: DataTypes.STRING,
        allowNull: true,
        unique: true,
      },
      name: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      email: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      phone: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      company_name: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      // Admin follow-up tracking, updated from the admin panel only.
      status: {
        type: DataTypes.ENUM("new", "contacted", "followed_up"),
        allowNull: false,
        defaultValue: "new",
      },
      message: {
        type: DataTypes.TEXT,
        allowNull: true,
      },
      // Google reCAPTCHA v3 score at submission time, kept for audit / threshold tuning.
      recaptcha_score: {
        type: DataTypes.FLOAT,
        allowNull: true,
      },
      deleted_at: {
        type: DataTypes.DATE,
      },
    },
    {
      tableName: "quote_requests",
      timestamps: true,
      paranoid: true,
      deletedAt: "deleted_at",
    },
  );

  QuoteRequest.associate = function (models) {
    QuoteRequest.hasMany(models.QuoteRequestItem, {
      foreignKey: "quote_request_id",
      as: "items",
    });
  };

  return QuoteRequest;
};
