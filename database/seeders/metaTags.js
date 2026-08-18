const { models } = require("../models");

/**
 * Seed default meta tags for important pages
 */
const defaultMetaTags = [
    {
        page_id: 1,
        page_slug: "home",
        meta_title: "Zandscarpets | Premium Carpets & Flooring Solutions",
        meta_description: "Explore Zandscarpets' premium range of carpets and flooring solutions crafted for quality, comfort, and style.",
        meta_keywords: "zandscarpets, carpets, flooring solutions, premium carpets",
        canonical_url: "/",
    },
    {
        page_id: 2,
        page_slug: "about",
        meta_title: "About Us | Zandscarpets",
        meta_description: "Learn more about Zandscarpets, our craftsmanship, and our commitment to quality carpets and flooring.",
        meta_keywords: "about zandscarpets, carpet company, flooring craftsmanship",
        canonical_url: "/about",
    },
    {
        page_id: 3,
        page_slug: "contact",
        meta_title: "Contact Us | Zandscarpets",
        meta_description: "Get in touch with Zandscarpets for support, product enquiries, or business partnerships.",
        meta_keywords: "contact zandscarpets, carpet enquiries, flooring support",
        canonical_url: "/contact",
    },
    {
        page_id: 4,
        page_slug: "our-works",
        meta_title: "Our Works | Zandscarpets",
        meta_description: "Browse Zandscarpets' portfolio of completed projects and installations showcasing our craftsmanship.",
        meta_keywords: "zandscarpets projects, carpet installations, our works",
        canonical_url: "/our-works",
    },
    {
        page_id: 5,
        page_slug: "products",
        meta_title: "Products | Zandscarpets",
        meta_description: "Discover Zandscarpets' full range of carpets and flooring products for every space and style.",
        meta_keywords: "zandscarpets products, carpet range, flooring products",
        canonical_url: "/products",
    },
    {
        page_id: 6,
        page_slug: "blogs",
        meta_title: "Blogs | Zandscarpets",
        meta_description: "Read the latest articles, trends, and tips on carpets, flooring, and interior design from Zandscarpets.",
        meta_keywords: "zandscarpets blog, carpet trends, flooring tips",
        canonical_url: "/blogs",
    },
    {
        page_id: 7,
        page_slug: "services",
        meta_title: "Services | Zandscarpets",
        meta_description: "Explore the range of services offered by Zandscarpets, from consultation to installation and maintenance.",
        meta_keywords: "zandscarpets services, carpet installation, flooring services",
        canonical_url: "/services",
    },
    {
        page_id: 8,
        page_slug: "main-category",
        meta_title: "Main Category | Zandscarpets",
        meta_description: "Browse Zandscarpets' main product categories to find the right carpet or flooring solution for you.",
        meta_keywords: "zandscarpets categories, carpet categories, flooring categories",
        canonical_url: "/main-category",
    },
    {
        page_id: 9,
        page_slug: "quote-listing",
        meta_title: "Quote Listing | Zandscarpets",
        meta_description: "View and manage your carpet and flooring quote requests with Zandscarpets.",
        meta_keywords: "zandscarpets quotes, carpet quote listing, flooring quotes",
        canonical_url: "/quote-listing",
    },
    {
        page_id: 10,
        page_slug: "quote-form",
        meta_title: "Get a Quote | Zandscarpets",
        meta_description: "Request a personalized quote from Zandscarpets for your carpet and flooring needs.",
        meta_keywords: "zandscarpets quote form, request a quote, carpet quote",
        canonical_url: "/quote-form",
    },
    {
        page_id: 11,
        page_slug: "enquiry-quote",
        meta_title: "Enquiry & Quote | Zandscarpets",
        meta_description: "Send an enquiry or request a quote from Zandscarpets for our carpet and flooring solutions.",
        meta_keywords: "zandscarpets enquiry, carpet enquiry, request quote",
        canonical_url: "/enquiry-quote",
    },
    {
        page_id: 12,
        page_slug: "download-pdf",
        meta_title: "Download Brochure | Zandscarpets",
        meta_description: "Download Zandscarpets' product brochures and catalogues in PDF format.",
        meta_keywords: "zandscarpets brochure, download pdf, carpet catalogue",
        canonical_url: "/download-pdf",
    },
    {
        page_id: 13,
        page_slug: "privacy-policy",
        meta_title: "Privacy Policy | Zandscarpets",
        meta_description: "Understand how Zandscarpets collects, uses, and protects your personal data.",
        meta_keywords: "zandscarpets privacy policy, data protection, user privacy",
        canonical_url: "/privacy-policy",
    },
];

const seedMetaTags = async () => {
    try {
        for (const tagData of defaultMetaTags) {
            const { page_slug, ...defaults } = tagData;

            const page = await models.Page.findOne({ where: { page_slug } });
            if (!page) {
                console.warn(`⚠️ Skipping meta tags for "${page_slug}" — page not found. Run seedPages first.`);
                continue;
            }

            const [record, created] = await models.MetaData.findOrCreate({
                where: { page_id: page.id },
                defaults: { ...defaults, page_id: page.id },
            });

            if (created) {
                console.log(`✅ Created meta tags for page: ${page_slug}`);
            } else {
                console.log(`ℹ️ Meta tags for page "${page_slug}" already exist. Skipping.`);
            }
        }
    } catch (error) {
        console.error("❌ Failed to seed meta tags:", error.message || error);
        throw error;
    }
};

module.exports = { seedMetaTags };
