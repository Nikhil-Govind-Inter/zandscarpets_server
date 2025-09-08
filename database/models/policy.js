const { DataTypes } = require("sequelize");

module.exports = (sequelize) => {
    const Policy = sequelize.define(
        "Policy",
        {
            id: {
                type: DataTypes.INTEGER,
                autoIncrement: true,
                primaryKey: true,
            },
            slug: {
                type: DataTypes.ENUM("privacy-policy", "terms-and-conditions","cookie-policy"),
                allowNull: true,
            },
            title: {
                type: DataTypes.TEXT,
                allowNull: true,
            },
            highlight_title: {
                type: DataTypes.TEXT,
                allowNull: true,
            },
            description: {
                type: DataTypes.TEXT,
                allowNull: true,
            },
            sub_description: {
                type: DataTypes.TEXT,
                allowNull: true,
            },
             faq_title: {
                type: DataTypes.TEXT,
                allowNull: true,
            },
            faq_highlight_title: {
                type: DataTypes.TEXT,
                allowNull: true,
            },
            faq_button_text: {
                type: DataTypes.TEXT,
                allowNull: true,
            },
            faq_button_link: {
                type: DataTypes.TEXT,
                allowNull: true,
            },
           
            deletedAt: {
                type: DataTypes.DATE,
            },
        },
        {
            tableName: "policy",
            timestamps: true,
        }
    );

    return Policy;
};
