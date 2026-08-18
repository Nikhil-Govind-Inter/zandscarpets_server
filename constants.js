export const PORT = process.env.PORT;
export const NODE_ENV = process.env.NODE_ENV;
export const JWT_SECRET = process.env.JWT_SECRET;
export const JWT_ISSUER = process.env.JWT_ISSUER;
export const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || "15m";
export const JWT_REFRESH_EXPIRES_IN = process.env.JWT_REFRESH_EXPIRES_IN || "30d";
export const DB_NAME = process.env.DB_NAME;
export const DB_USERNAME = process.env.DB_USERNAME;
export const DB_PASSWORD = process.env.DB_PASSWORD;
export const DB_HOST = process.env.DB_HOST;
export const DB_PORT = process.env.DB_PORT;
export const DATABASE_URL = process.env.DATABASE_URL;
export const DB_DIALECT = process.env.DB_DIALECT;
export const REDIS_URL = process.env.REDIS_URL;
export const BREVO_API_KEY = process.env.BREVO_API_KEY;
export const BREVO_DEFAULT_FROM = process.env.BREVO_DEFAULT_FROM;
export const BREVO_DEFAULT_FROM_NAME = process.env.BREVO_DEFAULT_FROM_NAME;
export const BREVO_DEFAULT_REPLY_TO = process.env.BREVO_DEFAULT_REPLY_TO;
export const BREVO_SEND_URL = process.env.BREVO_SEND_URL;


export const OTP_TTL_SECONDS = 5 * 60; // OTP + attempts counter both expire in 5 minutes
export const OTP_MAX_ATTEMPTS = 3;
export const OTP_RESEND_COOLDOWN_SECONDS = 60;
export const OTP_LOCKOUT_COOLDOWN_SECONDS = 5 * 60; // cooldown after hitting max attempts
export const RESET_TOKEN_TTL_SECONDS = 10 * 60;

export const ACCESS_COOKIE_NAME = "access_token";
export const REFRESH_COOKIE_NAME = "refresh_token";