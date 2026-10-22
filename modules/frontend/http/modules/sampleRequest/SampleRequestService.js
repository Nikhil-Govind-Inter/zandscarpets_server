const { QueryTypes } = require("sequelize");
const { models, sequelize } = require("../../../../../database/models");
const Mailer = require("../../../../../services/mailerServices");
const Logger = require("../../../../../config/logger");
const { verifyRecaptchaToken } = require("../../../../../services/recaptchaService");
const { HttpError } = require("../../traits/HttpError");
const { message } = require("./sampleRequestMessages");

const text = (value) => value ?? "";

// 400 that points at one form field (the controller turns `fieldErrors` into the `errors` list)
const fieldError = (lang, field, key) => {
  const error = new HttpError(message(lang, key), 400, "VALIDATION_ERROR");
  error.fieldErrors = [{ field, message: message(lang, key) }];
  return error;
};

class SampleRequestService {
  // Dropdown data for the "Get a sample" form: every active category and every active product
  // (with its category), both languages per title. One small, cacheable response.
  static async options() {
    const [categories, products] = await Promise.all([
      sequelize.query(
        `SELECT id, slug, title, title_ar FROM product_categories
         WHERE is_active = true AND deleted_at IS NULL AND slug IS NOT NULL
         ORDER BY sort_order ASC, id ASC`,
        { type: QueryTypes.SELECT },
      ),
      sequelize.query(
        `SELECT p.slug, p.title, p.title_ar, c.slug AS category_slug
         FROM products p
         JOIN product_categories c ON c.id = p.product_category_id AND c.is_active = true AND c.deleted_at IS NULL
         WHERE p.is_active = true AND p.deleted_at IS NULL
         ORDER BY p.title ASC`,
        { type: QueryTypes.SELECT },
      ),
    ]);

    return {
      categories: categories.map((row) => ({
        slug: row.slug,
        title: text(row.title),
        title_ar: text(row.title_ar),
      })),
      products: products.map((row) => ({
        slug: row.slug,
        title: text(row.title),
        title_ar: text(row.title_ar),
        category_slug: row.category_slug,
      })),
    };
  }

  static async create(payload, lang = "en") {
    await verifyRecaptchaToken(payload.recaptcha_token, { action: "sample_request" });

    const [category] = await sequelize.query(
      `SELECT id, title FROM product_categories
       WHERE slug = :slug AND is_active = true AND deleted_at IS NULL`,
      { replacements: { slug: payload.category }, type: QueryTypes.SELECT },
    );
    if (!category) {
      throw fieldError(lang, "category", "categoryInvalid");
    }

    const [product] = await sequelize.query(
      `SELECT id, title FROM products
       WHERE slug = :slug AND product_category_id = :categoryId AND is_active = true AND deleted_at IS NULL`,
      { replacements: { slug: payload.product, categoryId: category.id }, type: QueryTypes.SELECT },
    );
    if (!product) {
      throw fieldError(lang, "product", "productInvalid");
    }

    const item = await models.SampleRequest.create({
      name: payload.name,
      phone: payload.phone,
      email: payload.email,
      company_name: payload.company_name || null,
      product_category_id: category.id,
      category_title: category.title,
      product_id: product.id,
      product_title: product.title,
    });

    // An SMTP outage must never fail the already-saved request.
    Mailer.sendSampleRequestAdminNotification(item).catch((error) =>
      Logger.error("Sample request admin notification failed", {
        message: error.message,
        requestId: item.id,
      }),
    );
    Mailer.sendSampleRequestConfirmation(item).catch((error) =>
      Logger.error("Sample request confirmation email failed", {
        message: error.message,
        requestId: item.id,
      }),
    );

    return { id: item.id };
  }
}

module.exports = SampleRequestService;
