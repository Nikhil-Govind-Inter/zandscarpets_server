const { Op } = require("sequelize");
const { models } = require("../models");
const { PAGE_NAME_SLUGS } = require("./pagenames");

/**
 * Seed default meta tags for the static page names in `pagenames.js`.
 * A page's meta is keyed by its slug (meta_data.page_name) — no link to the
 * pages table.
 */
const defaultMetaTags = [
    {
        page_name: "home",
        meta_title: "Zandscarpets | Trusted Flooring Specialists in UAE & GCC",
        meta_description: "Zandscarpets offers premium carpets, vinyl, laminate, and flooring solutions with expert installation across the UAE & GCC.",
        meta_keywords: "zandscarpets, carpets, flooring, vinyl flooring, laminate flooring",
    },
    {
        page_name: "about",
        meta_title: "About Us | Zandscarpets",
        meta_description: "Learn more about Zandscarpets, our craftsmanship, and our commitment to quality carpets and flooring.",
        meta_keywords: "about zandscarpets, carpet company, flooring craftsmanship",
    },
    {
        page_name: "services",
        meta_title: "Services | Zandscarpets",
        meta_description: "Explore the range of services offered by Zandscarpets, from consultation to installation and maintenance.",
        meta_keywords: "zandscarpets services, carpet installation, flooring services",
    },
    {
        page_name: "contact",
        meta_title: "Contact Us | Zandscarpets",
        meta_description: "Get in touch with Zandscarpets for support, product enquiries, or business partnerships.",
        meta_keywords: "contact zandscarpets, carpet enquiries, flooring support",
    },
    {
        page_name: "blogs",
        meta_title: "Blogs | Zandscarpets",
        meta_description: "Read the latest articles, trends, and tips on carpets, flooring, and interior design from Zandscarpets.",
        meta_keywords: "zandscarpets blog, carpet trends, flooring tips",
    },
    {
        page_name: "downloads",
        meta_title: "Resources | Zandscarpets",
        meta_description: "Browse Zandscarpets' guides, brochures, and helpful resources on carpets and flooring.",
        meta_keywords: "zandscarpets resources, carpet guides, flooring brochures",
    },
    {
        page_name: "privacy-policy",
        meta_title: "Privacy Policy | Zandscarpets",
        meta_description: "Understand how Zandscarpets collects, uses, and protects your personal data.",
        meta_keywords: "zandscarpets privacy policy, data protection, user privacy",
    },
    {
        page_name: "our-work",
        meta_title: "Our Work | Zandscarpets",
        meta_description: "Browse Zandscarpets' portfolio of completed projects and installations showcasing our craftsmanship.",
        meta_keywords: "zandscarpets projects, carpet installations, our works",
    },
];

const seedMetaTags = async () => {
    try {
        // Clean up rows left behind when the old page_id FK was replaced by
        // page_name: any page-type row whose slug isn't in the current list
        // (or has no slug at all) no longer maps to a real page.
        const orphanCount = await models.MetaData.destroy({
            where: {
                type: "page",
                [Op.or]: [{ page_name: null }, { page_name: { [Op.notIn]: PAGE_NAME_SLUGS } }],
            },
        });
        if (orphanCount) {
            console.log(`🧹 Removed ${orphanCount} orphaned page meta rows`);
        }

        for (const tagData of defaultMetaTags) {
            const [record, created] = await models.MetaData.findOrCreate({
                where: { type: "page", page_name: tagData.page_name },
                defaults: { ...tagData },
            });

            if (created) {
                console.log(`✅ Created meta tags for page: ${tagData.page_name}`);
            } else {
                console.log(`ℹ️ Meta tags for page "${tagData.page_name}" already exist. Skipping.`);
            }
        }
    } catch (error) {
        console.error("❌ Failed to seed meta tags:", error.message || error);
        throw error;
    }
};

module.exports = { seedMetaTags, defaultMetaTags };