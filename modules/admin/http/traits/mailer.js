const Logger = require("../../../../config/logger");

const BREVO_SEND_URL = "https://api.brevo.com/v3/smtp/email";

/**
 * Sends a one-time-password email via the Brevo transactional email REST API
 * using the platform's global fetch (Node 22) — no extra HTTP client dependency.
 * Throws on any non-2xx response so callers can tell "user not found" (handled
 * silently upstream) apart from "the email provider actually failed".
 */
const sendOtpEmail = async (toEmail, otp) => {
  const apiKey = process.env.BREVO_API_KEY;
  const fromEmail = process.env.BREVO_DEFAULT_FROM;
  const replyTo = process.env.BREVO_DEFAULT_REPLY_TO || fromEmail;

  if (!apiKey || !fromEmail) {
    throw new Error("Email provider is not configured (missing BREVO_API_KEY/BREVO_DEFAULT_FROM)");
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
    Logger.error("Brevo OTP email send failed", { status: response.status, body });
    throw new Error("Failed to send OTP email");
  }
};

module.exports = { sendOtpEmail };
