const { models } = require("../models");

/**
 * Seed the default set of Pages used across the site
 */
const defaultPages = [
    { page: "Home", page_slug: "home", link: "/", show_in_nav: true, show_in_footer: true, sort_order: 1, is_active: true },
    { page: "About Us", page_slug: "about", link: "/about", show_in_nav: true, show_in_footer: true, sort_order: 2, is_active: true },
    { page: "Products", page_slug: "products", link: "/products", show_in_nav: true, show_in_footer: true, sort_order: 3, is_active: true },
    { page: "Category", page_slug: "main-category", link: "/category", show_in_nav: true, show_in_footer: true, sort_order: 4, is_active: true },
    { page: "Services", page_slug: "services", link: "/services", show_in_nav: true, show_in_footer: true, sort_order: 5, is_active: true },
    { page: "Works", page_slug: "our-works", link: "/works", show_in_nav: true, show_in_footer: true, sort_order: 6, is_active: true },
    { page: "Blogs", page_slug: "blogs", link: "/blogs", show_in_nav: true, show_in_footer: true, sort_order: 7, is_active: true },
    { page: "Downloads", page_slug: "download-pdf", link: "/downloads", show_in_nav: false, show_in_footer: true, sort_order: 8, is_active: true },
    { page: "Seasonal Offer", page_slug: "seasonal-offer", link: "/seasonal-offer", show_in_nav: false, show_in_footer: true, sort_order: 9, is_active: true },
    { page: "Quotes", page_slug: "quote-listing", link: "/quotes", show_in_nav: false, show_in_footer: true, sort_order: 10, is_active: true },
    { page: "Quote Form", page_slug: "quote-form", link: "/quotes/form", show_in_nav: false, show_in_footer: true, sort_order: 11, is_active: true },
    { page: "Contact", page_slug: "contact", link: "/contact", show_in_nav: true, show_in_footer: true, sort_order: 12, is_active: true },
    { page: "Privacy Policy", page_slug: "privacy-policy", link: "/privacy-policy", show_in_nav: false, show_in_footer: true, sort_order: 13, is_active: true },
    // Not a public page; kept so existing references to this slug keep working.
    { page: "Enquiry Quote", page_slug: "enquiry-quote", link: "", show_in_nav: false, show_in_footer: false, sort_order: 14, is_active: true },
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
                await record.update(pageData);
                console.log(`🔄 Updated page: ${pageData.page}`);
            }
        }
    } catch (error) {
        console.error("❌ Failed to seed pages:", error.message || error);
        throw error;
    }
};

module.exports = { seedPages };
