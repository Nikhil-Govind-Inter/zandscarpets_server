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
        page: "health-care-professional-landing",
        meta_title: "Healthcare Professionals | Join Xpress Health",
        meta_description: "Discover flexible opportunities for nurses, doctors, and allied health professionals.",
        meta_keywords: "nursing jobs, healthcare jobs, flexible shifts",
        canonical_url: "/health-care-professional-landing",
    },
    {
        page: "app-features-professional",
        meta_title: "App Features for Professionals | Xpress Health",
        meta_description: "Manage shifts, track payments, and explore opportunities with our professional app.",
        meta_keywords: "healthcare app, nursing app, job management",
        canonical_url: "/app-features-professional",
    },
    {
        page: "app-features-providers",
        meta_title: "App Features for Providers | Xpress Health",
        meta_description: "Hire qualified professionals, manage schedules, and streamline operations with our provider app.",
        meta_keywords: "healthcare provider app, hire nurses, hospital staffing",
        canonical_url: "/app-features-providers",
    },
    {
        page: "pharmacy-landing",
        meta_title: "Pharmacy Solutions | Xpress Health",
        meta_description: "Connect pharmacies with qualified staff and discover digital solutions for pharmacy management.",
        meta_keywords: "pharmacy staffing, pharmacy jobs, healthcare pharmacy",
        canonical_url: "/pharmacy-landing",
    },
    {
        page: "power-of-ai",
        meta_title: "The Power of AI in Healthcare | Xpress Health",
        meta_description: "Learn how AI is transforming healthcare staffing and workforce management.",
        meta_keywords: "AI healthcare, healthcare technology, AI staffing",
        canonical_url: "/power-of-ai",
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
    {
        page: "cookie-policy",
        meta_title: "Cookie Policy | Xpress Health",
        meta_description: "Learn about the cookies we use to improve your browsing experience.",
        meta_keywords: "cookie policy, website cookies, browsing privacy",
        canonical_url: "/cookie-policy",
    },
    {
        page: "professional-faq",
        meta_title: "FAQs for Healthcare Professionals | Xpress Health",
        meta_description: "Find answers to frequently asked questions by healthcare professionals.",
        meta_keywords: "healthcare FAQ, nursing FAQ, professional support",
        canonical_url: "/professional-faq",
    },
    {
        page: "provider-faq",
        meta_title: "FAQs for Healthcare Providers | Xpress Health",
        meta_description: "Answers to common questions asked by hospitals and healthcare providers.",
        meta_keywords: "provider FAQ, hospital FAQ, staffing FAQ",
        canonical_url: "/provider-faq",
    },
    {
        page: "refer-a-friend",
        meta_title: "Refer a Friend | Xpress Health",
        meta_description: "Refer your colleagues and friends to Xpress Health and earn rewards.",
        meta_keywords: "refer a friend, healthcare referral, referral program",
        canonical_url: "/refer-a-friend",
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