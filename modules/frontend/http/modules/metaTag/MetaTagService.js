const { models } = require("../../../../../database/models");
const { getCache, setCache, cacheKeys } = require("../../traits/cacheHelper");
const { t } = require("../../traits/localeHelper");
const { HttpError } = require("../../traits/HttpError");

class MetaTagService {
  static async index(req) {
    const page = req?.query?.page;
    const lang = req?.query?.lang === "ar" ? "ar" : "en";
    const cacheKey = cacheKeys.metaTags(page, lang);

    const cached = await getCache(req, cacheKey);
    if (cached) return { data: cached, fromCache: true };

    const meta = await models.MetaData.findOne({
      where: { type: "page", page_name: page },
    });

    if (!meta) {
      throw new HttpError("Meta data not found", 404, "NOT_FOUND");
    }

    const data = {
      page: meta.page_name,
      meta_title: t(lang, meta.meta_title, meta.meta_title_ar),
      meta_description: t(lang, meta.meta_description, meta.meta_description_ar),
      meta_keywords: t(lang, meta.meta_keywords, meta.meta_keywords_ar),
    };

    await setCache(req, cacheKey, data);

    return { data };
  }

  /*
   * Resolves SEO meta for one target: a page slug (`page`), a product
   * (`product_id`), a product variant (`variant_id`) or an individual blog
   * post (`blog_id`). Exactly one target is expected — the controller
   * enforces that before this runs.
   */
  static async byTarget(req) {
    const lang = req?.query?.lang === "ar" ? "ar" : "en";
    const page = String(req?.query?.page || "").trim();
    const productId = Number.parseInt(req?.query?.product_id, 10);
    const variantId = Number.parseInt(req?.query?.variant_id, 10);
    const blogId = String(req?.query?.blog_id || "").trim();

    let target;
    let where;
    if (page) {
      target = `page:${page}`;
      where = { type: "page", page_name: page };
    } else if (Number.isInteger(productId) && productId > 0) {
      target = `product:${productId}`;
      where = { type: "product", product_id: productId };
    } else if (Number.isInteger(variantId) && variantId > 0) {
      target = `variant:${variantId}`;
      where = { type: "product-variant", variant_id: variantId };
    } else if (blogId) {
      target = `blog:${blogId}`;
      where = { type: "blog", blog_id: blogId };
    } else {
      throw new HttpError(
        "Query param `page`, `product_id`, `variant_id` or `blog_id` is required",
        400,
        "BAD_REQUEST",
      );
    }

    const cacheKey = cacheKeys.metaTarget(target, lang);
    const cached = await getCache(req, cacheKey);
    if (cached) return { data: cached, fromCache: true };

    const meta = await models.MetaData.findOne({
      where,
      include: [
        {
          model: models.Products,
          as: "product",
          attributes: ["id", "title", "slug"],
        },
        {
          model: models.ProductVariants,
          as: "variant",
          attributes: ["id", "label"],
        },
      ],
    });

    if (!meta) {
      throw new HttpError("Meta data not found", 404, "NOT_FOUND");
    }

    const data = {
      type: meta.type,
      page: meta.type === "page" ? meta.page_name : null,
      product:
        meta.type === "product" && meta.product
          ? { id: meta.product.id, title: meta.product.title, slug: meta.product.slug }
          : null,
      variant:
        meta.type === "product-variant" && meta.variant
          ? { id: meta.variant.id, label: meta.variant.label }
          : null,
      blog: meta.type === "blog" ? meta.blog_id : null,
      meta_title: t(lang, meta.meta_title, meta.meta_title_ar),
      meta_description: t(lang, meta.meta_description, meta.meta_description_ar),
      meta_keywords: t(lang, meta.meta_keywords, meta.meta_keywords_ar),
      other_meta: t(lang, meta.other_meta, meta.other_meta_ar),
    };

    await setCache(req, cacheKey, data);

    return { data };
  }
}

module.exports = MetaTagService;
