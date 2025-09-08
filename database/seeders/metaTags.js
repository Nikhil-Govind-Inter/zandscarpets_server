// seeders/meta-tags-seeder.js

const MetaTags = require("../models").models.MetaTags;

/**
 * Seed default meta tags for important pages
 */
const defaultMetaTags = [
    {
        page: "home",
        meta_title: "Xpress Health - Smarter Healthcare Staffing",
        meta_description: "Find healthcare professionals, providers, and pharmacies instantly with Xpress Health.",
        meta_keywords: "healthcare staffing, nursing jobs, healthcare professionals",
        canonical_url: "/",
    },
    
    {
        page: "about",
        meta_title: "About Us | Xpress Health",
        meta_description: "Learn more about Xpress Health, our mission, and our commitment to healthcare innovation.",
        meta_keywords: "about xpress health, healthcare company, healthcare innovation",
        canonical_url: "/about",
    },
    {
        page: "blog-listing",
        meta_title: "Healthcare Insights & News | Xpress Health Blog",
        meta_description: "Read the latest articles, trends, and news in healthcare and staffing.",
        meta_keywords: "healthcare blog, healthcare news, staffing insights",
        canonical_url: "/blog-listing",
    },
    {
        page: "contact",
        meta_title: "Contact Us | Xpress Health",
        meta_description: "Get in touch with Xpress Health for support, partnerships, or general inquiries.",
        meta_keywords: "contact xpress health, healthcare support, partnerships",
        canonical_url: "/contact",
    },
    {
        page: "terms-and-conditions",
        meta_title: "Terms and Conditions | Xpress Health",
        meta_description: "Read the terms and conditions for using Xpress Health’s platform and services.",
        meta_keywords: "terms of service, xpress health policies",
        canonical_url: "/terms-and-conditions",
    },
    {
        page: "privacy-policy",
        meta_title: "Privacy Policy | Xpress Health",
        meta_description: "Understand how Xpress Health collects, uses, and protects your personal data.",
        meta_keywords: "privacy policy, data protection, user privacy",
        canonical_url: "/privacy-policy",
    },
];

const seedMetaTags = async () => {
    try {
        for (const tagData of defaultMetaTags) {
            const [record, created] = await MetaTags.findOrCreate({
                where: { page: tagData.page },
                defaults: tagData,
            });

            if (created) {
                console.log(`✅ Created meta tags for page: ${tagData.page}`);
            } else {
                console.log(`ℹ️ Meta tags for page "${tagData.page}" already exist. Skipping.`);
            }
        }
    } catch (error) {
        console.error("❌ Failed to seed meta tags:", error.message || error);
        throw error;
    }
};

module.exports = { seedMetaTags };