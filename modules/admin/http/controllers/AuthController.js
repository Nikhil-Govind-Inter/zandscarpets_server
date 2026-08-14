const bcrypt = require("bcrypt");
const crypto = require("crypto");
const jwt = require("jsonwebtoken");
const { validationResult } = require("express-validator");
const { sequelize, models } = require("../../../../database/models/index");
const { sendValidationError, sendSuccessResponse, sendErrorResponse, sendUnauthorizedError } = require("../traits/responseHandler");
const { validationRequestPost, validationLogin } = require("../request/auth/AuthRequest");
const {
  ACCESS_TOKEN_EXPIRES_IN,
  REFRESH_TOKEN_EXPIRES_IN,
  ACCESS_COOKIE_NAME,
  REFRESH_COOKIE_NAME,
  setAuthCookies,
  clearAuthCookies,
} = require("../traits/authCookies");
const ms = require("ms");

const AdminUser = models.AdminUser;
const AdminRefreshToken = models.AdminRefreshToken;

const SAFE_USER_ATTRIBUTES = ["id", "username", "email", "role", "createdAt", "updatedAt"];

const signAccessToken = (user) =>
  jwt.sign(
    { id: user.id, username: user.username, role: user.role },
    process.env.JWT_SECRET || "fallback-secret-key",
    {
      expiresIn: ACCESS_TOKEN_EXPIRES_IN,
      issuer: process.env.JWT_ISSUER || "your-app-name",
    }
  );

const hashToken = (rawToken) => crypto.createHash("sha256").update(rawToken).digest("hex");

const issueRefreshToken = async (userId) => {
  const rawToken = crypto.randomBytes(40).toString("hex");
  const expiresAt = new Date(Date.now() + ms(REFRESH_TOKEN_EXPIRES_IN));

  const row = await AdminRefreshToken.create({
    userId,
    tokenHash: hashToken(rawToken),
    expiresAt,
  });

  return { rawToken, row };
};

class AuthController {
  static async register(req, res) {
    await Promise.all(validationRequestPost.map(v => v.run(req)));
    const errors = validationResult(req);
    if (!errors.isEmpty()) return sendValidationError(res, errors);

    try {
      const { username, password, email, role } = req.body;

      // Check existing user
      const existingUserByUsername = await AdminUser.findOne({ where: { username } });
      if (existingUserByUsername) {
        return sendErrorResponse(res, new Error("Username already exists"), { statusCode: 409 });
      }

      const existingUserByEmail = await AdminUser.findOne({ where: { email } });
      if (existingUserByEmail) {
        return sendErrorResponse(res, new Error("Email already exists"), { statusCode: 409 });
      }

      // Hash password
      const hashedPassword = await bcrypt.hash(password, 12);

      const user = await sequelize.transaction(async (t) =>
        AdminUser.create(
          { username, email, password: hashedPassword, role: role || "user" },
          { transaction: t }
        )
      );

      return sendSuccessResponse(res, { user }, "User registered successfully", 201);
    } catch (error) {
      console.error("Register error:", error);
      return sendErrorResponse(res, error);
    }
  }

  static async login(req, res) {
    await Promise.all(validationLogin.map(v => v.run(req)));
    const errors = validationResult(req);
    if (!errors.isEmpty()) return sendValidationError(res, errors);

    try {
      const { username, password } = req.body;
      const user = await AdminUser.findOne({
        where: { username, status: true },
        attributes: [...SAFE_USER_ATTRIBUTES, "password"],
      });

      if (!user) return sendUnauthorizedError(res, "Invalid username or password");

      const isPasswordValid = await bcrypt.compare(password, user.password);
      if (!isPasswordValid) return sendUnauthorizedError(res, "Invalid username or password");

      const { password: _password, ...safeUser } = user.toJSON();

      const accessToken = signAccessToken(safeUser);
      const { rawToken: refreshToken } = await issueRefreshToken(safeUser.id);

      setAuthCookies(res, { accessToken, refreshToken });

      sendSuccessResponse(res, { user: safeUser, token: accessToken }, "Login successful");
    } catch (error) {
      console.error("Login error:", error);
      sendErrorResponse(res, error);
    }
  }

  static async refresh(req, res) {
    try {
      const rawToken = req.cookies?.[REFRESH_COOKIE_NAME];
      if (!rawToken) return sendUnauthorizedError(res, "Refresh token required");

      const tokenHash = hashToken(rawToken);
      const existingRow = await AdminRefreshToken.findOne({ where: { tokenHash } });

      if (!existingRow) {
        clearAuthCookies(res);
        return sendUnauthorizedError(res, "Invalid refresh token");
      }

      if (existingRow.revokedAt) {
        // Reuse of an already-rotated/revoked refresh token — likely theft/replay.
        // Revoke every outstanding token for this user as a precaution.
        await AdminRefreshToken.update(
          { revokedAt: new Date() },
          { where: { userId: existingRow.userId, revokedAt: null } }
        );
        clearAuthCookies(res);
        return sendUnauthorizedError(res, "Session invalid, please log in again");
      }

      if (existingRow.expiresAt.getTime() < Date.now()) {
        clearAuthCookies(res);
        return sendUnauthorizedError(res, "Refresh token expired");
      }

      const user = await AdminUser.findOne({
        where: { id: existingRow.userId, status: true },
        attributes: SAFE_USER_ATTRIBUTES,
      });

      if (!user) {
        clearAuthCookies(res);
        return sendUnauthorizedError(res, "User not found");
      }

      const { rawToken: newRefreshToken, row: newRow } = await issueRefreshToken(user.id);
      existingRow.revokedAt = new Date();
      existingRow.replacedByTokenId = newRow.id;
      await existingRow.save();

      const accessToken = signAccessToken(user);
      setAuthCookies(res, { accessToken, refreshToken: newRefreshToken });

      sendSuccessResponse(res, { user }, "Token refreshed");
    } catch (error) {
      console.error("Refresh error:", error);
      sendErrorResponse(res, error);
    }
  }

  static async logout(req, res) {
    try {
      const accessToken = req.headers.authorization?.split(" ")[1] || req.cookies?.[ACCESS_COOKIE_NAME];
      const refreshToken = req.cookies?.[REFRESH_COOKIE_NAME];

      if (refreshToken) {
        const tokenHash = hashToken(refreshToken);
        await AdminRefreshToken.update(
          { revokedAt: new Date() },
          { where: { tokenHash, revokedAt: null } }
        );
      }

      if (accessToken) {
        const redisClient = req.app.get("redisClient");
        if (redisClient) {
          try {
            const decoded = jwt.decode(accessToken);
            const ttlSeconds = decoded?.exp ? Math.max(decoded.exp - Math.floor(Date.now() / 1000), 1) : ms(ACCESS_TOKEN_EXPIRES_IN) / 1000;
            await redisClient.set(`blacklist:${accessToken}`, "1", { EX: ttlSeconds });
          } catch (err) {
            console.error("Logout blacklist error:", err.message);
          }
        }
      }

      clearAuthCookies(res);
      sendSuccessResponse(res, null, "Logout successful");
    } catch (error) {
      console.error("Logout error:", error);
      // Logout should never fail from the client's perspective.
      clearAuthCookies(res);
      sendSuccessResponse(res, null, "Logout successful");
    }
  }

  static async me(req, res) {
    try {
      const user = await AdminUser.findOne({
        where: { id: req.user.id, status: true },
        attributes: SAFE_USER_ATTRIBUTES,
      });

      if (!user) return sendUnauthorizedError(res, "User not found");

      sendSuccessResponse(res, { user }, "Current user");
    } catch (error) {
      console.error("Me error:", error);
      sendErrorResponse(res, error);
    }
  }



  static async forgotPassword(req, res) {
    // Implement forgot password logic here
    try {
      const { username } = req.body;

      const isUserExists = await AdminUser.findOne({ where: { username } });
      if (!isUserExists) {
        return sendErrorResponse(res, new Error("User not found"), { statusCode: 404 });
      }

      // send the one time otp to user email for password reset
       
      // Here you would typically generate a password reset token and send it via email.
      // For now, we will just log the action.
      sendSuccessResponse(res, null, "Forgot password endpoint hit");
    } catch (error) {
      sendErrorResponse(res, error);
    }
  }

  static async resetPassword(req, res) {
    // Implement reset password logic here
    try {
      
    } catch (error) {
      
    }
    sendSuccessResponse(res, null, "Reset password endpoint hit");
  }
}

module.exports = AuthController;
