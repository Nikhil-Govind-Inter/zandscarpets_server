const nodemailer = require("nodemailer");
const Logger = require("../config/logger");
const { models } = require("../database/models");
const { redisClient } = require("../config/redisClient");
const { cacheKeys, DEFAULT_TTL } = require("../modules/admin/http/traits/cacheHelper");
const {
  EMAIL_FROM,
  EMAIL_FROM_NAME,
  SMTP_HOST,
  SMTP_PORT,
  SMTP_SECURE,
  SMTP_USER,
  SMTP_PASS,
} = require("../constants");

const transporter = nodemailer.createTransport({
  host: SMTP_HOST,
  port: Number(SMTP_PORT),
  secure: SMTP_SECURE === "true",
  auth: { user: SMTP_USER, pass: SMTP_PASS },
});

class MailerService {
  /**
   * Resolves the "from" address for all outgoing admin emails: the
   * DB-configured SiteSettings.admin_email, read through the same Redis
   * cache key SiteSettingsController uses (so an admin_email change is
   * picked up as soon as SiteSettingsController.update invalidates it),
   * falling back to EMAIL_FROM if no SiteSettings row/admin_email
   * exists yet or Redis is unavailable. Shared by every mailer method so
   * the sender address is resolved once, not duplicated per email type.
   */
  static async getFromEmail() {
    const cacheKey = cacheKeys.siteSettings();
    let siteSettings = null;

    if (redisClient?.isOpen) {
      try {
        const cached = await redisClient.get(cacheKey);
        if (cached) siteSettings = JSON.parse(cached);
      } catch (error) {
        Logger.error("mailerServices: siteSettings cache read failed", { message: error.message });
      }
    }

    if (!siteSettings) {
      siteSettings = await models.SiteSettings.findOne();
      if (siteSettings && redisClient?.isOpen) {
        try {
          await redisClient.set(cacheKey, JSON.stringify(siteSettings), { EX: DEFAULT_TTL });
        } catch (error) {
          Logger.error("mailerServices: siteSettings cache write failed", { message: error.message });
        }
      }
    }

    return siteSettings?.admin_email || EMAIL_FROM;
  }

  /**
   * Shared SMTP transactional-email send, factored out of sendOtpEmail so
   * every email type (OTP, contact-enquiry notification/confirmation) shares
   * one send/error-handling path instead of duplicating the nodemailer
   * boilerplate. Throws on any send failure, or if SMTP isn't configured, so
   * callers can tell a real provider failure apart from a handled-upstream case.
   */
  static async sendEmail({ toEmail, toName, subject, htmlContent, replyTo }) {
    const fromEmail = await MailerService.getFromEmail();
    const finalReplyTo = replyTo || fromEmail;

    if (!SMTP_HOST || !SMTP_USER || !SMTP_PASS || !fromEmail) {
      throw new Error("Email provider is not configured (missing SMTP_HOST/SMTP_USER/SMTP_PASS/from address)");
    }

    try {
      const info = await transporter.sendMail({
        from: { address: fromEmail, name: EMAIL_FROM_NAME || undefined },
        replyTo: finalReplyTo,
        to: toName ? { address: toEmail, name: toName } : toEmail,
        subject,
        html: htmlContent,
      });

      // A successful sendMail only means the message was accepted by the SMTP
      // server, not that it was delivered — log the messageId so a given send
      // can be cross-checked if the recipient reports non-delivery.
      Logger.info("SMTP email accepted", { messageId: info.messageId, subject, toEmail });
    } catch (error) {
      Logger.error("SMTP email send failed", { message: error.message, subject, toEmail });
      throw new Error(`SMTP email send failed: ${error.message}`);
    }
  }

  /**
   * Sends a one-time-password email for admin password resets.
   */
  static async sendOtpEmail(toEmail, otp) {
    return MailerService.sendEmail({
      toEmail,
      subject: "Your password reset code",
      htmlContent: `
        <div style="font-family: Arial, sans-serif; max-width: 480px; margin: 0 auto;">
          <h2>Password reset code</h2>
          <p>Use the code below to reset your admin password. This code expires in 5 minutes.</p>
          <p style="font-size: 32px; font-weight: bold; letter-spacing: 8px;">${otp}</p>
          <p>If you did not request this, you can safely ignore this email.</p>
        </div>
      `,
    });
  }

  /**
   * Notifies the site admin of a newly submitted contact enquiry. Reply-to is
   * set to the submitter's email so the admin can hit "reply" and it goes
   * straight to them.
   */
  static async sendContactEnquiryAdminNotification(enquiry) {
    const adminEmail = await MailerService.getFromEmail();
    return MailerService.sendEmail({
      toEmail: adminEmail,
      subject: `New Contact Enquiry from ${enquiry.name}`,
      htmlContent: `
        <div style="font-family: Arial, sans-serif; max-width: 560px; margin: 0 auto;">
          <h2>New contact enquiry received</h2>
          <table style="width:100%; border-collapse: collapse;">
            <tr><td style="padding:6px 0;"><strong>Name</strong></td><td>${enquiry.name}</td></tr>
            <tr><td style="padding:6px 0;"><strong>Email</strong></td><td>${enquiry.email}</td></tr>
            <tr><td style="padding:6px 0;"><strong>Phone</strong></td><td>${enquiry.phone}</td></tr>
            <tr><td style="padding:6px 0;"><strong>Requirements</strong></td><td>${enquiry.requirements}</td></tr>
            ${enquiry.file ? `<tr><td style="padding:6px 0;"><strong>Attachment</strong></td><td>Attached</td></tr>` : ""}
          </table>
          <p>Submitted on ${new Date(enquiry.createdAt || Date.now()).toLocaleString()}.</p>
        </div>
      `,
      replyTo: enquiry.email,
    });
  }

  /**
   * Sends a "we've received your enquiry" confirmation to the submitter.
   */
  static async sendContactEnquiryConfirmation(enquiry) {
    return MailerService.sendEmail({
      toEmail: enquiry.email,
      toName: enquiry.name,
      subject: "We've received your enquiry",
      htmlContent: `
        <div style="font-family: Arial, sans-serif; max-width: 480px; margin: 0 auto;">
          <h2>Thanks for reaching out, ${enquiry.name}!</h2>
          <p>We've received your enquiry and our team will get back to you shortly.</p>
          <p style="color:#555;">Your message: "${enquiry.requirements}"</p>
        </div>
      `,
    });
  }
}

module.exports = MailerService;
