const ms = require("ms");
const {
  JWT_EXPIRES_IN,
  JWT_REFRESH_EXPIRES_IN,
  ACCESS_COOKIE_NAME,
  REFRESH_COOKIE_NAME,
  NODE_ENV,
} = require("../../../../constants");

const ACCESS_TOKEN_EXPIRES_IN = JWT_EXPIRES_IN;
const REFRESH_TOKEN_EXPIRES_IN = JWT_REFRESH_EXPIRES_IN;

// Refresh cookie is scoped to /api/backend/auth so the browser only ever
// sends it to the auth endpoints that need it, not to every API call.
const REFRESH_COOKIE_PATH = "/api/backend/auth";

// Dev: the SPA (localhost:8080) and API (localhost:5000) differ only by port,
// which browsers still treat as same-site, so SameSite=Lax cookies are sent
// on fetch() and no HTTPS is needed. Production: SameSite=None + Secure
// (requires HTTPS) so a separately hosted admin domain can send the cookies.

const sameSite = NODE_ENV === "production" ? "none" : "lax";
const secure = NODE_ENV === "production";

const accessCookieOptions = () => ({
  httpOnly: true,
  secure,
  sameSite,
  path: "/",
  maxAge: ms(ACCESS_TOKEN_EXPIRES_IN),
});

const refreshCookieOptions = () => ({
  httpOnly: true,
  secure,
  sameSite,
  path: REFRESH_COOKIE_PATH,
  maxAge: ms(REFRESH_TOKEN_EXPIRES_IN),
});

const setAuthCookies = (res, { accessToken, refreshToken }) => {
  res.cookie(ACCESS_COOKIE_NAME, accessToken, accessCookieOptions());
  res.cookie(REFRESH_COOKIE_NAME, refreshToken, refreshCookieOptions());
};

const setAccessCookie = (res, accessToken) => {
  res.cookie(ACCESS_COOKIE_NAME, accessToken, accessCookieOptions());
};

const clearAuthCookies = (res) => {
  res.clearCookie(ACCESS_COOKIE_NAME, {
    httpOnly: true,
    secure,
    sameSite,
    path: "/",
  });
  res.clearCookie(REFRESH_COOKIE_NAME, {
    httpOnly: true,
    secure,
    sameSite,
    path: REFRESH_COOKIE_PATH,
  });
};

module.exports = {
  ACCESS_TOKEN_EXPIRES_IN,
  REFRESH_TOKEN_EXPIRES_IN,
  ACCESS_COOKIE_NAME,
  REFRESH_COOKIE_NAME,
  setAuthCookies,
  setAccessCookie,
  clearAuthCookies,
};
