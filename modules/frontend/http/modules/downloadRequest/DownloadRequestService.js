const { models } = require("../../../../../database/models");
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
    const download = await models.Downloads.findOne({
      where: { id: payload.download_id, is_active: true },
    });
    if (!download) throw fieldError(lang, "download_id", "downloadInvalid");

    const item = await models.DownloadRequest.create({
      name: payload.name,
      phone: payload.phone,
      email: payload.email,
      company_name: payload.company_name || null,
      download_id: download.id,
      download_title: download.title,
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
