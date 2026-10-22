const { QueryTypes } = require("sequelize");
const { models, sequelize } = require("../../../../../database/models");
const Mailer = require("../../../../../services/mailerServices");
const Logger = require("../../../../../config/logger");
const { HttpError } = require("../../traits/HttpError");
const { message } = require("./downloadRequestMessages");

const fieldError = (lang, field, key) => {
  const error = new HttpError(message(lang, key), 400, "VALIDATION_ERROR");
  error.fieldErrors = [{ field, message: message(lang, key) }];
  return error;
};

class DownloadRequestService {
  // Same "lead capture, no automatic file" flow as SampleRequest: saved, the admin is notified,
  // the requester gets a confirmation — the file itself is sent by hand, never auto-attached.
  static async create(payload, lang = "en") {
    let download_id = null;
    let download_title = null;
    let product_id = null;
    let product_title = null;

    if (payload.product) {
      const [product] = await sequelize.query(
        `SELECT id, title FROM products
         WHERE slug = :slug AND is_active = true AND deleted_at IS NULL`,
        { replacements: { slug: payload.product }, type: QueryTypes.SELECT },
      );
      if (!product) throw fieldError(lang, "product", "productInvalid");
      product_id = product.id;
      product_title = product.title;
    } else {
      const download = await models.Downloads.findOne({
        where: { id: payload.download_id, is_active: true },
      });
      if (!download) throw fieldError(lang, "download_id", "downloadInvalid");
      download_id = download.id;
      download_title = download.title;
    }

    const item = await models.DownloadRequest.create({
      name: payload.name,
      phone: payload.phone,
      email: payload.email,
      company_name: payload.company_name || null,
      download_id,
      download_title,
      product_id,
      product_title,
    });

    // An SMTP outage must never fail the already-saved request.
    Mailer.sendDownloadRequestAdminNotification(item).catch((error) =>
      Logger.error("Download request admin notification failed", {
        message: error.message,
        requestId: item.id,
      }),
    );
    Mailer.sendDownloadRequestConfirmation(item).catch((error) =>
      Logger.error("Download request confirmation email failed", {
        message: error.message,
        requestId: item.id,
      }),
    );

    return { id: item.id };
  }
}

module.exports = DownloadRequestService;
