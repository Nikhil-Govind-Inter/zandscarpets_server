const { models } = require("../models");

const defaultData = [
  {
    slug: "privacy-policy",
    title: "Privacy Policy",
    description: "Description for privacy policy",
  },
  {
    slug: "terms-and-conditions",
    title: "Terms and Conditions",
    description: "Description for terms and conditions",
  },
   {
    slug: "cookie-policy",
    title: "Cookie Policy",
    description: "Description for Cookie Policy",
  },
];

const policyData = async () => {
  try {
    for (const policy of defaultData) {
      const [record, created] = await models.Policy.findOrCreate({
        where: { slug: policy.slug },
        defaults: policy,
      });

      if (created) {
        console.log(`✅ Created policy record for: ${policy.slug}`);
      } else {
        console.log(`ℹ️ Policy record for "${policy.slug}" already exists. Skipping.`);
      }
    }
  } catch (error) {
    console.error("❌ Failed to seed policy data:", error.message || error);
    throw error;
  }
};

module.exports = { policyData };
