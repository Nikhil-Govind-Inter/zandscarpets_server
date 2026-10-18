const fs = require("fs");
const Mailer = require("../../../../../services/mailerServices");
const { models } = require("../../../../../database/models");
const Logger = require("../../../../../config/logger");
const { HttpError } = require("../../traits/HttpError");
const { message } = require("./contactEnquiryMessages");

class ContactEnquiryService {

  static async create(payload, file, lang = "en") {
   
    const isExisting = await models.ContactEnquiry.findOne({
      where: { email: payload.email },
    });

    if (isExisting) {
      // the upload is already on disk by now; don't keep it for a rejected enquiry
      if (file?.path) await fs.promises.unlink(file.path).catch(() => {});
      // 409 + a stable code so the storefront can show a clear message
      throw new HttpError(message(lang, "alreadySubmitted"), 409, "ALREADY_SUBMITTED");
    }
    
    const item = await models.ContactEnquiry.create({
      ...payload,
      file: file ? file.path.replace(/\\/g, "/") : null,
    });

    // Independently try/caught, and not awaited before returning — an SMTP
    // outage must never fail the already-saved enquiry, and the submitter
    // shouldn't wait on two sequential email sends.
    Mailer.sendContactEnquiryAdminNotification(item).catch((error) =>
      Logger.error("Contact enquiry admin notification failed", {
        message: error.message,
        enquiryId: item.id,
      }),
    );

    Mailer.sendContactEnquiryConfirmation(item).catch((error) =>
      Logger.error("Contact enquiry confirmation email failed", {
        message: error.message,
        enquiryId: item.id,
      }),
    );

    return item;
  }
}

module.exports = ContactEnquiryService;
