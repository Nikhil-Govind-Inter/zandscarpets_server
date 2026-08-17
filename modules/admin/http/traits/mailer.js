const Logger = require("../../../../config/logger");
const { models } = require("../../../../database/models");
const { redisClient } = require("../../../../config/redisClient");
const { cacheKeys, DEFAULT_TTL } = require("./cacheHelper");

const BREVO_SEND_URL = process.env.BREVO_SEND_URL;

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

    return siteSettings?.admin_email || process.env.BREVO_DEFAULT_FROM;
  }

  /**
   * Sends a one-time-password email via the Brevo transactional email REST API
   * using the platform's global fetch (Node 22) — no extra HTTP client dependency.
   * Throws on any non-2xx response so callers can tell "user not found" (handled
   * silently upstream) apart from "the email provider actually failed".
   */
  static async sendOtpEmail(toEmail, otp) {
    const apiKey = process.env.BREVO_API_KEY;
    const fromEmail = process.env.BREVO_DEFAULT_FROM;
    const replyTo = process.env.BREVO_DEFAULT_REPLY_TO || fromEmail;

    if (!apiKey || !fromEmail) {
      throw new Error("Email provider is not configured (missing BREVO_API_KEY/from address)");
    }

    const response = await fetch(BREVO_SEND_URL, {
      method: "POST",
      headers: {
        "api-key": apiKey,
        "content-type": "application/json",
        accept: "application/json",
      },
      body: JSON.stringify({
        sender: { email: fromEmail },
        replyTo: { email: replyTo },
        to: [{ email: toEmail }],
        subject: "Your password reset code",
        htmlContent: `
        <div style="font-family: Arial, sans-serif; max-width: 480px; margin: 0 auto;">
          <h2>Password reset code</h2>
          <p>Use the code below to reset your admin password. This code expires in 5 minutes.</p>
          <p style="font-size: 32px; font-weight: bold; letter-spacing: 8px;">${otp}</p>
          <p>If you did not request this, you can safely ignore this email.</p>
        </div>
      `,
      }),
    });

    if (!response.ok) {
      const body = await response.text().catch(() => "");

      Logger.error("Brevo OTP email send failed", { status: response.status, body
      });
      throw new Error(`Brevo OTP email send failed: ${body}`);
    }

    // Brevo returning 2xx only means the message was accepted into its send
    // queue, not that it was delivered — log the messageId/body so a given
    // send can be cross-checked against Brevo's Transactional > Email
    // Activity dashboard if the recipient reports non-delivery.
    const body = await response.json().catch(() => null);
    Logger.info("Brevo OTP email accepted", { status: response.status, fromEmail, toEmail, body });
  }
}

module.exports = Mailer;
