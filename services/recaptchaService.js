const Logger = require("../config/logger");
const { HttpError } = require("../modules/frontend/http/traits/HttpError");
const { RECAPTCHA_SECRET_KEY } = require("../constants");

const VERIFY_URL = "https://www.google.com/recaptcha/api/siteverify";

/**
 * Verifies a Google reCAPTCHA v3 token server-side. Throws an HttpError(400)
 * if the token is missing/invalid, the score is below threshold, or the
 * action doesn't match - the only abuse defense on the no-auth quote-request
 * endpoint, so a verification failure must block the submission.
 */
const verifyRecaptchaToken = async (token, { action, minScore = 0.5 } = {}) => {
  if (!RECAPTCHA_SECRET_KEY) {
    Logger.error("RECAPTCHA_SECRET_KEY is not configured; rejecting submission");
    throw new HttpError("Unable to verify request", 500, "RECAPTCHA_NOT_CONFIGURED");
  }

  if (!token) {
    throw new HttpError("reCAPTCHA verification failed", 400, "RECAPTCHA_FAILED");
  }

  let result;
  try {
    const response = await fetch(VERIFY_URL, {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: new URLSearchParams({ secret: RECAPTCHA_SECRET_KEY, response: token }),
    });
    result = await response.json();
  } catch (error) {
    Logger.error("reCAPTCHA verification request failed: " + error.message);
    throw new HttpError("Unable to verify request", 502, "RECAPTCHA_VERIFY_UNAVAILABLE");
  }

  const score = typeof result?.score === "number" ? result.score : null;

  if (
    !result?.success ||
    score === null ||
    score < minScore ||
    (action && result?.action !== action)
  ) {
    Logger.error("reCAPTCHA verification rejected: " + JSON.stringify(result));
    throw new HttpError("reCAPTCHA verification failed", 400, "RECAPTCHA_FAILED");
  }

  return { score };
};

module.exports = { verifyRecaptchaToken };
