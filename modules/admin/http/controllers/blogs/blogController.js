const fs = require("fs");
const path = require("path");
const {
  sendSuccessResponse,
  sendErrorResponse,
} = require("../../traits/responseHandler");

// Blog posts aren't server DB entities — they live in the storefront's
// next-intl dictionaries. Point at the storefront repo's `messages/` folder
// (same monorepo layout), overridable for other deployments.
const MESSAGES_DIR =
  process.env.STOREFRONT_MESSAGES_PATH ||
  path.resolve(__dirname, "../../../../../../z_and_s_carpets_website/messages");

class BlogController {
  /*
   * @route   GET /api/backend/blogs/active
   * @desc    Blog posts (id = slug, title) for pickers; reads the storefront
   *          i18n dictionary so the admin can pick a post instead of typing.
   * @access  Auth
   */
  static async getActive(req, res) {
    try {
      const posts = BlogController.readBlogPosts();
      return sendSuccessResponse(res, posts, "Blog posts retrieved successfully");
    } catch (error) {
      return sendErrorResponse(res, error);
    }
  }

  static readBlogPosts() {
    const en = BlogController.readItems("en");
    const ar = BlogController.readItems("ar");

    const byId = new Map();
    for (const item of en) {
      byId.set(item.id, { id: item.id, title: item.title, title_ar: null });
    }
    // Two files are keyed by the same slug; merge the Arabic titles in.
    for (const item of ar) {
      const existing = byId.get(item.id);
      if (existing) {
        existing.title_ar = item.title || existing.title_ar;
      } else {
        byId.set(item.id, { id: item.id, title: item.title, title_ar: item.title });
      }
    }
    return [...byId.values()];
  }

  // Reads `<lang>.json` → `Blogs.Items`; tolerates a missing/unparseable file.
  static readItems(lang) {
    try {
      const file = path.join(MESSAGES_DIR, `${lang}.json`);
      const raw = JSON.parse(fs.readFileSync(file, "utf8"));
      const items = raw?.Blogs?.Items;
      return Array.isArray(items)
        ? items
            .filter((item) => item && item.id && item.title)
            .map((item) => ({ id: String(item.id), title: String(item.title) }))
        : [];
    } catch {
      return [];
    }
  }
}

module.exports = BlogController;