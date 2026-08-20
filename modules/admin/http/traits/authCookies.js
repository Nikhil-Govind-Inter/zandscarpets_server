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

// The admin SPA (localhost:8080) and API (localhost:5000) run on different
// ports in dev, i.e. cross-site as far as cookies are concerned, so a plain
// SameSite=Lax cookie would never be attached to the SPA's fetch() calls
// (Lax only rides along on top-level GET navigations, not XHR/fetch). We use
// SameSite=None + Secure everywhere instead — modern browsers treat
// http://localhost as a secure context, so Secure cookies still work over
// plain HTTP there. In production, where this is expected to be deployed
// behind a single reverse-proxied origin, same-site Lax would also work, but
// None+Secure works equally well for a same-origin deployment and avoids a
// NODE_ENV-dependent behavior difference between dev and prod.
// Strict
const sameSite = "Strict";
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
  clearAuthCookies,
};
