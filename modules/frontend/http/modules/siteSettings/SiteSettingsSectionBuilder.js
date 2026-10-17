const { singleMediaWithoutType } = require("../../traits/mediaButtonHelper");
const { t, localizeMedia } = require("../../traits/localeHelper");
const { inlineRichText } = require("../../traits/sectionHelpers");

// Product cards per category in the navbar dropdown
const NAV_CARDS_PER_CATEGORY = 2;

class SiteSettingsSectionBuilder {
  // Navigation bar: header logo, the categories flagged show_in_navbar (nested by parent) and
  // the pages flagged show_in_nav.
  static buildNav(cmsData, lang, categories = [], pages = [], products = []) {
    return {
      logo: localizeMedia(singleMediaWithoutType(cmsData, "header_logo_media_path", "header_logo_media_alt", "header_logo_media_alt_ar"), lang),
      categories: this.buildCategoryTree(categories, lang, products),
      pages: this.buildPages(pages, lang),
    };
  }

  // Nested tree among the flagged categories. A flagged category whose parent isn't flagged
  // (or inactive) is promoted to the top level, so it still shows up.
  static buildCategoryTree(categories, lang, products = []) {
    // featured products per category, capped (the dropdown shows a couple of cards)
    const productsByCategory = new Map();
    for (const product of products) {
      const list = productsByCategory.get(product.product_category_id) ?? [];
      if (list.length < NAV_CARDS_PER_CATEGORY) {
        list.push({
          id: product.id,
          slug: product.slug,
          title: t(lang, product.title, product.title_ar),
          badge: product.badge ? t(lang, product.badge.title, product.badge.title_ar) : null,
          image: localizeMedia(singleMediaWithoutType(product, "list_media_path", "list_media_alt", "list_media_alt_ar"), lang),
        });
        productsByCategory.set(product.product_category_id, list);
      }
    }

    const byId = new Map(
      categories.map((item) => [
        item.id,
        {
          id: item.id,
          slug: item.slug,
          title: t(lang, item.title, item.title_ar),
          products: productsByCategory.get(item.id) ?? [],
          children: [],
        },
      ]),
    );
    const roots = [];
    for (const item of categories) {
      const node = byId.get(item.id);
      const parent = item.parent_id ? byId.get(item.parent_id) : null;
      (parent ?? { children: roots }).children.push(node);
    }
    return this.pruneEmptyCategories(roots);
  }

  // Drop categories that have no products and no sub-category with products
  // (nothing to show in the dropdown for them)
  static pruneEmptyCategories(nodes) {
    return nodes
      .map((node) => ({ ...node, children: this.pruneEmptyCategories(node.children) }))
      .filter((node) => node.products.length > 0 || node.children.length > 0);
  }

  // Pages with a link, in admin order (an empty link can't be navigated to)
  static buildPages(pages, lang) {
    return pages
      .filter((item) => item?.link)
      .map((item) => ({
        title: t(lang, item.page, item.page_ar) || item.page,
        slug: item.page_slug,
        link: item.link,
      }));
  }

  static buildFooter(cmsData, lang, socialMedia = [], footerMedia = [], footerProducts = [], footerServices = [], pages = []) {
    return {
      logo: localizeMedia(singleMediaWithoutType(cmsData, "footer_logo_media_path", "footer_logo_media_alt", "footer_logo_media_alt_ar"), lang),
      // admin edits the address in a rich-text editor; keep only inline formatting
      address: inlineRichText(t(lang, cmsData?.address, cmsData?.address_ar)),
      email: cmsData?.email ?? "",
      phone: cmsData?.phone_number ?? "",
      whatsapp_number: cmsData?.whatsapp_number ?? "",

      pages: this.buildPages(pages, lang),

      social_media: socialMedia.map((item) => ({
        media: this.buildMedia(item, lang, "footer_media_path"),
        link: item?.link ?? "",
      })),

      products: footerProducts.map((item) => ({
        title: t(lang, item.title, item.title_ar),
        slug: item.slug,
      })),

      services: footerServices.map((item) => ({
        id: item.id,
        title: t(lang, item.title, item.title_ar),
      })),

      footer_media: footerMedia.map((item) => ({
        media: this.buildMedia(item, lang),
      })),
    };
  }

  static buildFloatingButtons(icons, lang) {
    return icons.map((item) => ({
      icon: localizeMedia(singleMediaWithoutType(item, "media_path", "media_alt", "media_alt_ar"), lang),
      link: item?.link ?? "",
    }));
  }

  static buildMedia(item, lang, pathKey = "media_path", fallbackPathKey) {
    const key = item?.[pathKey] || !fallbackPathKey ? pathKey : fallbackPathKey;
    const { path, alt } = localizeMedia(singleMediaWithoutType(item, key, "media_alt", "media_alt_ar"), lang);
    return { media_path: path, media_alt: alt };
  }
}

module.exports = SiteSettingsSectionBuilder;
