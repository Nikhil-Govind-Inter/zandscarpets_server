const Mailer = require("../../../../../services/mailerServices");
const { models } = require("../../../../../database/models");
const Logger = require("../../../../../config/logger");

class ContactEnquiryService {

  static async create(payload, file) {
   
    const isExisting = await models.ContactEnquiry.findOne({
      where: { email: payload.email },
    });

    if (isExisting) {
      throw new Error("Email already exists");
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
