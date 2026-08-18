const { models } = require("../models");

/**
 * Seed the default set of Pages used across the site
 */
const defaultPages = [
    { page: "home", page_slug: "home", is_active: true },
    { page: "about", page_slug: "about", is_active: true },
    { page: "contact", page_slug: "contact", is_active: true },
    { page: "our works", page_slug: "our-works", is_active: true },
    { page: "products", page_slug: "products", is_active: true },
    { page: "blogs", page_slug: "blogs", is_active: true },
    { page: "services", page_slug: "services", is_active: true },
    { page: "main category", page_slug: "main-category", is_active: true },
    { page: "quote listing", page_slug: "quote-listing", is_active: true },
    { page: "quote form", page_slug: "quote-form", is_active: true },
    { page: "enquiry quote", page_slug: "enquiry-quote", is_active: true },
    { page: "download pdf", page_slug: "download-pdf", is_active: true },
    { page: "privacy policy", page_slug: "privacy-policy", is_active: true },
];

const seedPages = async () => {
    try {
        for (const pageData of defaultPages) {
            const [record, created] = await models.Page.findOrCreate({
                where: { page_slug: pageData.page_slug },
                defaults: pageData,
            });

            if (created) {
                console.log(`✅ Created page: ${pageData.page}`);
            } else {
                console.log(`ℹ️ Page "${pageData.page}" already exists. Skipping.`);
            }
        }
    } catch (error) {
        console.error("❌ Failed to seed pages:", error.message || error);
        throw error;
    }
};

module.exports = { seedPages };
