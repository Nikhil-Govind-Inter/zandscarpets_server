const express = require("express");
const router = express.Router();
const Mailer = require("../../../services/mailerServices");
const { ApiResponse } = require("../http/traits/response");
const { HTTP_STATUS } = require("../http/traits/constants");
const { ErrorHandler } = require("../http/traits/errorHandler");

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

/*
 * @route   GET /api/frontend/mail-test?to=someone@example.com
 * @desc    Sends a simple test email through the configured MAIL_PROVIDER.
 *          For verifying mailer setup only — safe to remove once confirmed working.
 * @access  Public
 */
router.get("/", async (req, res) => {
  const toEmail = req.query.to;

  if (!toEmail || !EMAIL_RE.test(toEmail)) {
    return ApiResponse.error(res, {
      message: "Provide a valid recipient email as ?to=someone@example.com",
      status: HTTP_STATUS.BAD_REQUEST,
      error_code: "VALIDATION_ERROR",
    });
  }

  try {
    await Mailer.sendEmail({
      toEmail,
      subject: "Z&S mailer test",
      htmlContent: `
        <div style="font-family: Arial, sans-serif;">
          <h2>Mailer test</h2>
          <p>If you're reading this, the mail service is working.</p>
          <p style="color:#555;">Sent at ${new Date().toLocaleString()}.</p>
        </div>
      `,
    });

    return ApiResponse.success(res, {
      message: `Test email sent to ${toEmail}`,
      status: HTTP_STATUS.OK,
    });
  } catch (error) {
    return ErrorHandler.handleControllerError(error, res, "MailTest");
  }
});

module.exports = router;
