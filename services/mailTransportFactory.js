const nodemailer = require("nodemailer");
const {
  MAIL_PROVIDER,
  SMTP_HOST,
  SMTP_PORT,
  SMTP_SECURE,
  SMTP_USER,
  SMTP_PASS,
  GMAIL_SMTP_USER,
  GMAIL_SMTP_PASS,
  BREVO_SMTP_HOST,
  BREVO_SMTP_PORT,
  BREVO_SMTP_USER,
  BREVO_SMTP_PASS,
} = require("../constants");

function resolveTransportOptions() {
  const provider = (MAIL_PROVIDER || "smtp").toLowerCase();

  if (provider === "gmail") {
    return {
      host: "smtp.gmail.com",
      port: 587,
      secure: false,
      auth: { user: GMAIL_SMTP_USER, pass: GMAIL_SMTP_PASS },
    };
  }

  if (provider === "brevo") {
    return {
      host: BREVO_SMTP_HOST || "smtp-relay.brevo.com",
      port: Number(BREVO_SMTP_PORT || 587),
      secure: false,
      auth: { user: BREVO_SMTP_USER, pass: BREVO_SMTP_PASS },
    };
  }

  // Default "smtp" provider: the pre-existing generic config, so an .env
  // left untouched keeps sending mail exactly as it does today.
  return {
    host: SMTP_HOST,
    port: Number(SMTP_PORT),
    secure: SMTP_SECURE === "true",
    auth: { user: SMTP_USER, pass: SMTP_PASS },
  };
}

function createMailTransport() {
  const options = resolveTransportOptions();
  return { transporter: nodemailer.createTransport(options), options };
}

module.exports = { createMailTransport };
