const Logger = require("../../../../config/logger");
const { models } = require("../../../../database/models");
const { redisClient } = require("../../../../config/redisClient");
const { cacheKeys, DEFAULT_TTL } = require("./cacheHelper");
const {
  BREVO_DEFAULT_FROM,
  BREVO_API_KEY,
  BREVO_DEFAULT_REPLY_TO,
  BREVO_SEND_URL,
  BREVO_DEFAULT_FROM_NAME,
} = require("../../../../constants");


class Mailer {
  /**
   * Resolves the "from" address for all outgoing admin emails: the
   * DB-configured SiteSettings.admin_email, read through the same Redis
   * cache key SiteSettingsController uses (so an admin_email change is
   * picked up as soon as SiteSettingsController.update invalidates it),
   * falling back to BREVO_DEFAULT_FROM if no SiteSettings row/admin_email
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
        Logger.error("mailer: siteSettings cache read failed", { message: error.message });
      }
    }

    if (!siteSettings) {
      siteSettings = await models.SiteSettings.findOne();
      if (siteSettings && redisClient?.isOpen) {
        try {
          await redisClient.set(cacheKey, JSON.stringify(siteSettings), { EX: DEFAULT_TTL });
        } catch (error) {
          Logger.error("mailer: siteSettings cache write failed", { message: error.message });
        }
      }
    }

    return siteSettings?.admin_email || BREVO_DEFAULT_FROM;
  }

  /**
   * Shared Brevo transactional-email send, factored out of sendOtpEmail so
   * every email type (OTP, contact-enquiry notification/confirmation) shares
   * one fetch/error-handling path instead of duplicating the Brevo request
   * boilerplate. Uses the platform's global fetch (Node 22) — no extra HTTP
   * client dependency. Throws on any non-2xx response, or if Brevo isn't
   * configured, so callers can tell a real provider failure apart from a
   * handled-upstream case.
   */
  static async sendEmail({ toEmail, toName, subject, htmlContent, replyTo }) {
    const fromEmail = await Mailer.getFromEmail();
    const finalReplyTo = replyTo || BREVO_DEFAULT_REPLY_TO || fromEmail;

    if (!BREVO_API_KEY || !fromEmail) {
      throw new Error("Email provider is not configured (missing BREVO_API_KEY/from address)");
    }
    if (!BREVO_SEND_URL) {
      throw new Error("Email provider is not configured (missing BREVO_SEND_URL)");
    }

    const response = await fetch(BREVO_SEND_URL, {
      method: "POST",
      headers: {
        "api-key": BREVO_API_KEY,
        "content-type": "application/json",
        accept: "application/json",
      },
      body: JSON.stringify({
        sender: { email: fromEmail, name: BREVO_DEFAULT_FROM_NAME || undefined },
        replyTo: { email: finalReplyTo },
        to: [{ email: toEmail, name: toName || undefined }],
        subject,
        htmlContent,
      }),
    });

    if (!response.ok) {
      const body = await response.text().catch(() => "");
      Logger.error("Brevo email send failed", { status: response.status, body, subject, toEmail });
      throw new Error(`Brevo email send failed: ${body}`);
    }

    // Brevo returning 2xx only means the message was accepted into its send
    // queue, not that it was delivered — log the messageId/body so a given
    // send can be cross-checked against Brevo's Transactional > Email
    // Activity dashboard if the recipient reports non-delivery.
    const body = await response.json().catch(() => null);
    Logger.info("Brevo email accepted", { status: response.status, subject, toEmail, body });
  }

  /**
   * Sends a one-time-password email for admin password resets.
   */
  static async sendOtpEmail(toEmail, otp) {
    return Mailer.sendEmail({
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
      replyTo: BREVO_DEFAULT_REPLY_TO,
    });
  }

  /**
   * Notifies the site admin of a newly submitted contact enquiry. Reply-to is
   * set to the submitter's email so the admin can hit "reply" and it goes
   * straight to them.
   */
  static async sendContactEnquiryAdminNotification(enquiry) {
    const adminEmail = await Mailer.getFromEmail();
    return Mailer.sendEmail({
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
    return Mailer.sendEmail({
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
      replyTo: BREVO_DEFAULT_REPLY_TO,
    });
  }
}

module.exports = Mailer;
