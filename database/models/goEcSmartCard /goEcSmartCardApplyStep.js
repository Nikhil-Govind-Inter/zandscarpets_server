const { DataTypes } = require("sequelize");

module.exports = (sequelize) => {
    const GoEcSmartCardApplyStep = sequelize.define(
        "GoEcSmartCardApplyStep",
        {
            id: {
                type: DataTypes.INTEGER,
                autoIncrement: true,
                primaryKey: true,
            },
            title: {
                type: DataTypes.TEXT,
                allowNull: true,
            },
            description: {
                type: DataTypes.TEXT,
                allowNull: true,
            },
            media_path: {
                type: DataTypes.TEXT,
                allowNull: true,
            },
            media_alt: {
                type: DataTypes.STRING,
                allowNull: true,
            },
            status: {
                type: DataTypes.BOOLEAN,
                defaultValue: true,
            },
            sort_order: {
                type: DataTypes.SMALLINT,
                defaultValue: 0,
            },
            deletedAt: {
                type: DataTypes.DATE,
            },
        },
        {
            tableName: "go_ec_smart_card_apply_step",
            timestamps: true,
        }
    );

    return GoEcSmartCardApplyStep;
};
