const { models, sequelize } = require("../models");

/**
 * Snapshot of the `pages` table as it currently exists in the dev DB.
 * Upserts by `page_slug` (creates missing rows, updates existing ones); never deletes.
 * With `{ overwrite: false }` (used on server start) existing rows are left untouched so admin edits survive.
 *
 *   node database/seeders/pagesCurrent.js
 */
const pages = [
  { page: "Home", page_ar: null, page_slug: "home", link: "/", show_in_nav: false, show_in_footer: false, sort_order: 1, is_active: true },
  { page: "About Us", page_ar: "من نحن", page_slug: "about", link: "/about", show_in_nav: true, show_in_footer: true, sort_order: 2, is_active: true },
  { page: "Services", page_ar: "الخدمات", page_slug: "services", link: "/services", show_in_nav: true, show_in_footer: true, sort_order: 3, is_active: true },
  { page: "Works", page_ar: "أعمالنا", page_slug: "our-works", link: "/works", show_in_nav: true, show_in_footer: true, sort_order: 4, is_active: true },
  { page: "Resources", page_ar: "التنزيلات", page_slug: "downloads", link: "/downloads", show_in_nav: true, show_in_footer: false, sort_order: 5, is_active: true },
  { page: "Products", page_ar: "المنتجات", page_slug: "products", link: "/products", show_in_nav: false, show_in_footer: true, sort_order: 6, is_active: true },
  { page: "Category", page_ar: "الفئات", page_slug: "main-category", link: "/category", show_in_nav: false, show_in_footer: false, sort_order: 7, is_active: true },
  { page: "Our Insights", page_ar: "المدونات", page_slug: "blogs", link: "/blogs", show_in_nav: true, show_in_footer: true, sort_order: 8, is_active: true },
  { page: "Contact", page_ar: "تواصل معنا", page_slug: "contact", link: "/contact", show_in_nav: true, show_in_footer: true, sort_order: 9, is_active: true },
  { page: "Privacy Policy", page_ar: "سياسة الخصوصية", page_slug: "privacy-policy", link: "/privacy-policy", show_in_nav: false, show_in_footer: true, sort_order: 13, is_active: true },
];

const seedCurrentPages = async ({ overwrite = true } = {}) => {
  for (const data of pages) {
    // paranoid: false so a soft-deleted row with the same slug is restored instead of hitting the unique constraint
    const existing = await models.Page.findOne({ where: { page_slug: data.page_slug }, paranoid: false });
    if (existing && !overwrite) continue;
    if (existing) {
      if (existing.deleted_at) await existing.restore();
      await existing.update(data);
      console.log(`🔄 Updated page: ${data.page}`);
    } else {
      await models.Page.create(data);
      console.log(`✅ Created page: ${data.page}`);
    }
  }
};

module.exports = { seedCurrentPages };

if (require.main === module) {
  seedCurrentPages()
    .then(() => sequelize.close())
    .then(() => process.exit(0))
    .catch((err) => {
      console.error("❌ Failed to seed pages:", err.message || err);
      process.exit(1);
    });
}
