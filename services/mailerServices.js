const Logger = require("../config/logger");
const { models } = require("../database/models");
const { createMailTransport } = require("./mailTransportFactory");
const { EMAIL_FROM, EMAIL_FROM_NAME } = require("../constants");

const { transporter, options: transportOptions } = createMailTransport();

const escapeHtml = (value) =>
  String(value ?? "").replace(/[&<>"']/g, (char) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[char]);

// Transient network/soft-bounce errors worth a bounded retry; permanent
// failures (bad auth 535, invalid recipient 550, etc.) fail fast instead.
const RETRYABLE_ERROR = /ETIMEDOUT|ECONNRESET|ECONNREFUSED|EAI_AGAIN|ESOCKET|421|450|451/i;

async function sendMailWithRetry(mailOptions, { attempts = 3, baseDelayMs = 500 } = {}) {
  let lastError;
  for (let attempt = 1; attempt <= attempts; attempt++) {
    try {
      return await transporter.sendMail(mailOptions);
    } catch (error) {
      lastError = error;
      const isRetryable = RETRYABLE_ERROR.test(error.code || error.responseCode || error.message || "");
      if (attempt === attempts || !isRetryable) throw error;
      await new Promise((resolve) => setTimeout(resolve, baseDelayMs * 2 ** (attempt - 1)));
    }
  }
  throw lastError;
}

class MailerService {
  /**
   * Resolves the "from" address for all outgoing admin emails: the
   * DB-configured SiteSettings.admin_email, falling back to EMAIL_FROM if no
   * SiteSettings row/admin_email exists yet. Shared by every mailer method so
   * the sender address is resolved once, not duplicated per email type.
   */
  static async getFromEmail() {
    const siteSettings = await models.SiteSettings.findOne();
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

    if (!transportOptions.host || !transportOptions.auth?.user || !transportOptions.auth?.pass || !fromEmail) {
      throw new Error("Email provider is not configured (missing host/credentials/from address)");
    }

    try {
      const info = await sendMailWithRetry({
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
          <p style="font-size: 32px; font-weight: bold; letter-spacing: 8px;">${escapeHtml(otp)}</p>
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
      subject: `New Contact Enquiry from ${enquiry.name}`.replace(/[\r\n]+/g, " "),
      htmlContent: `
        <div style="font-family: Arial, sans-serif; max-width: 560px; margin: 0 auto;">
          <h2>New contact enquiry received</h2>
          <table style="width:100%; border-collapse: collapse;">
            <tr><td style="padding:6px 0;"><strong>Name</strong></td><td>${escapeHtml(enquiry.name)}</td></tr>
            <tr><td style="padding:6px 0;"><strong>Email</strong></td><td>${escapeHtml(enquiry.email)}</td></tr>
            <tr><td style="padding:6px 0;"><strong>Phone</strong></td><td>${escapeHtml(enquiry.phone)}</td></tr>
            <tr><td style="padding:6px 0;"><strong>Requirements</strong></td><td>${escapeHtml(enquiry.requirements)}</td></tr>
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
          <h2>Thanks for reaching out, ${escapeHtml(enquiry.name)}!</h2>
          <p>We've received your enquiry and our team will get back to you shortly.</p>
          <p style="color:#555;">Your message: "${escapeHtml(enquiry.requirements)}"</p>
        </div>
      `,
    });
  }

  /**
   * Notifies the site admin of a new sample request (reply-to is the requester).
   */
  static async sendSampleRequestAdminNotification(request) {
    const adminEmail = await MailerService.getFromEmail();
    const row = (label, value) =>
      value
        ? `<tr><td style="padding:6px 0;"><strong>${label}</strong></td><td>${escapeHtml(value)}</td></tr>`
        : "";
    return MailerService.sendEmail({
      toEmail: adminEmail,
      subject: `New Sample Request from ${request.name}`.replace(/[\r\n]+/g, " "),
      htmlContent: `
        <div style="font-family: Arial, sans-serif; max-width: 560px; margin: 0 auto;">
          <h2>New sample request received</h2>
          <table style="width:100%; border-collapse: collapse;">
            ${row("Name", request.name)}
            ${row("Phone", request.phone)}
            ${row("Email", request.email)}
            ${row("Company", request.company_name)}
            ${row("Category", request.category_title)}
            ${row("Product", request.product_title)}
          </table>
          <p>Submitted on ${new Date(request.createdAt || Date.now()).toLocaleString()}.</p>
        </div>
      `,
      replyTo: request.email,
    });
  }

  /**
   * Sends a "we've received your sample request" confirmation to the requester.
   */
  static async sendSampleRequestConfirmation(request) {
    return MailerService.sendEmail({
      toEmail: request.email,
      toName: request.name,
      subject: "We've received your sample request",
      htmlContent: `
        <div style="font-family: Arial, sans-serif; max-width: 480px; margin: 0 auto;">
          <h2>Thanks, ${escapeHtml(request.name)}!</h2>
          <p>We've received your sample request and our team will get in touch shortly.</p>
          ${request.product_title ? `<p style="color:#555;">Product: ${escapeHtml(request.product_title)}</p>` : ""}
        </div>
      `,
    });
  }

  /**
   * Notifies the site admin of a new download request (reply-to is the requester).
   */
  static async sendDownloadRequestAdminNotification(request) {
    const adminEmail = await MailerService.getFromEmail();
    const row = (label, value) =>
      value
        ? `<tr><td style="padding:6px 0;"><strong>${label}</strong></td><td>${escapeHtml(value)}</td></tr>`
        : "";
    return MailerService.sendEmail({
      toEmail: adminEmail,
      subject: `New Download Request from ${request.name}`.replace(/[\r\n]+/g, " "),
      htmlContent: `
        <div style="font-family: Arial, sans-serif; max-width: 560px; margin: 0 auto;">
          <h2>New download request received</h2>
          <table style="width:100%; border-collapse: collapse;">
            ${row("Name", request.name)}
            ${row("Phone", request.phone)}
            ${row("Email", request.email)}
            ${row("Company", request.company_name)}
            ${row("File", request.download_title || request.product_title)}
          </table>
          <p>Submitted on ${new Date(request.createdAt || Date.now()).toLocaleString()}.</p>
        </div>
      `,
      replyTo: request.email,
    });
  }

  /**
   * Sends a "we've received your download request" confirmation to the requester.
   */
  static async sendDownloadRequestConfirmation(request) {
    return MailerService.sendEmail({
      toEmail: request.email,
      toName: request.name,
      subject: "We've received your request",
      htmlContent: `
        <div style="font-family: Arial, sans-serif; max-width: 480px; margin: 0 auto;">
          <h2>Thanks, ${escapeHtml(request.name)}!</h2>
          <p>We've received your request and our team will send you the file shortly.</p>
          ${request.download_title || request.product_title ? `<p style="color:#555;">File: ${escapeHtml(request.download_title || request.product_title)}</p>` : ""}
        </div>
      `,
    });
  }

  /**
   * Notifies the site admin of a new quote request (reply-to is the requester).
   * Builds one row per line item, unlike the single-product siblings above.
   */
  static async sendQuoteRequestAdminNotification(quoteRequest) {
    const adminEmail = await MailerService.getFromEmail();
    const itemRows = (quoteRequest.items || [])
      .map(
        (item) => `
          <tr>
            <td style="padding:6px 0; border-bottom:1px solid #eee;">${escapeHtml(item.product_title)}</td>
            <td style="padding:6px 0; border-bottom:1px solid #eee;">${escapeHtml(item.variant_label || "-")}</td>
            <td style="padding:6px 0; border-bottom:1px solid #eee;">${item.quantity}</td>
          </tr>`,
      )
      .join("");

    return MailerService.sendEmail({
      toEmail: adminEmail,
      subject: `New Quote Request (${quoteRequest.reference_code}) from ${quoteRequest.name}`.replace(/[\r\n]+/g, " "),
      htmlContent: `
        <div style="font-family: Arial, sans-serif; max-width: 560px; margin: 0 auto;">
          <h2>New quote request received</h2>
          <p>Reference: <strong>${escapeHtml(quoteRequest.reference_code)}</strong></p>
          <table style="width:100%; border-collapse: collapse;">
            <tr><td style="padding:6px 0;"><strong>Name</strong></td><td>${escapeHtml(quoteRequest.name)}</td></tr>
            <tr><td style="padding:6px 0;"><strong>Phone</strong></td><td>${escapeHtml(quoteRequest.phone)}</td></tr>
            <tr><td style="padding:6px 0;"><strong>Email</strong></td><td>${escapeHtml(quoteRequest.email)}</td></tr>
            ${quoteRequest.company_name ? `<tr><td style="padding:6px 0;"><strong>Company</strong></td><td>${escapeHtml(quoteRequest.company_name)}</td></tr>` : ""}
            ${quoteRequest.message ? `<tr><td style="padding:6px 0;"><strong>Message</strong></td><td>${escapeHtml(quoteRequest.message)}</td></tr>` : ""}
          </table>
          <h3>Items</h3>
          <table style="width:100%; border-collapse: collapse;">
            <tr>
              <th style="text-align:left; padding:6px 0; border-bottom:2px solid #ddd;">Product</th>
              <th style="text-align:left; padding:6px 0; border-bottom:2px solid #ddd;">Variant</th>
              <th style="text-align:left; padding:6px 0; border-bottom:2px solid #ddd;">Qty</th>
            </tr>
            ${itemRows}
          </table>
          <p>Submitted on ${new Date(quoteRequest.createdAt || Date.now()).toLocaleString()}.</p>
        </div>
      `,
      replyTo: quoteRequest.email,
    });
  }

  /**
   * Sends a "we've received your quote request" confirmation to the requester,
   * including the generated reference code so they can quote it in follow-ups.
   */
  static async sendQuoteRequestConfirmation(quoteRequest) {
    const itemRows = (quoteRequest.items || [])
      .map(
        (item) => `
          <tr>
            <td style="padding:6px 0; border-bottom:1px solid #eee;">${escapeHtml(item.product_title)}</td>
            <td style="padding:6px 0; border-bottom:1px solid #eee;">${escapeHtml(item.variant_label || "-")}</td>
            <td style="padding:6px 0; border-bottom:1px solid #eee;">${item.quantity}</td>
          </tr>`,
      )
      .join("");

    return MailerService.sendEmail({
      toEmail: quoteRequest.email,
      toName: quoteRequest.name,
      subject: `Inquiry Received (${quoteRequest.reference_code})`,
      htmlContent: `
        <div style="font-family: Arial, sans-serif; max-width: 480px; margin: 0 auto;">
          <h2>Thanks, ${escapeHtml(quoteRequest.name)}!</h2>
          <p>Hello, <strong>${escapeHtml(quoteRequest.name)}</strong><br/>(ID - ${escapeHtml(quoteRequest.reference_code)})</p>
          <p>We've received your quote request. Our team will get back to you within 24 hours.</p>
          <table style="width:100%; border-collapse: collapse;">
            <tr>
              <th style="text-align:left; padding:6px 0; border-bottom:2px solid #ddd;">Product</th>
              <th style="text-align:left; padding:6px 0; border-bottom:2px solid #ddd;">Variant</th>
              <th style="text-align:left; padding:6px 0; border-bottom:2px solid #ddd;">Qty</th>
            </tr>
            ${itemRows}
          </table>
          ${quoteRequest.message ? `<p style="color:#555;">Your message: "${escapeHtml(quoteRequest.message)}"</p>` : ""}
        </div>
      `,
    });
  }
}

module.exports = MailerService;
