const bcrypt = require("bcrypt");
const { models } = require("../../../../../database/models");
const {
  sendSuccessResponse,
  sendErrorResponse,
  sendNotFoundError,
  sendValidationError,
  sendConflictError,
} = require("../../traits/responseHandler");
const { paginate } = require("../../traits/datatablePaginationHelper");
const { getCache, setCache, invalidateCache, cacheKeys } = require("../../traits/cacheHelper");
const {
  validationRequestPost,
  validationRequestUpdate,
  validateId,
} = require("../../request/user/userRequest");
const { validationResult } = require("express-validator");

const dataModel = models.AdminUser;

const SAFE_ATTRIBUTES = ["id", "username", "email", "role", "is_active", "updatedAt"];

const BCRYPT_ROUNDS = 12;

class UserController {
  static async list(req, res) {
    try {
      const listCacheKey = cacheKeys.userList(req);
      const cached = await getCache(req, listCacheKey);
      if (cached) {
        return sendSuccessResponse(
          res,
          cached,
          "User list retrieved successfully from cache",
        );
      }

      const result = await paginate(dataModel, req, {
        order: [["id", "ASC"]],
        searchFields: ["username", "email"],
        attributes: SAFE_ATTRIBUTES,
      });

      await setCache(req, listCacheKey, result);

      sendSuccessResponse(res, result, "User list retrieved successfully");
    } catch (error) {
      return sendErrorResponse(res, error);
    }
  }

  static async getById(req, res) {
    await Promise.all(validateId.map((validation) => validation.run(req)));

    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return sendValidationError(res, errors.array());
    }
    try {
      const { id } = req.params;

      const itemCacheKey = cacheKeys.userItem(id);
      const cached = await getCache(req, itemCacheKey);
      if (cached) {
        return sendSuccessResponse(res, cached, "User retrieved successfully");
      }

      const item = await dataModel.findByPk(id, { attributes: SAFE_ATTRIBUTES });
      if (!item) {
        return sendNotFoundError(res, "User");
      }

      await setCache(req, itemCacheKey, item);

      sendSuccessResponse(res, item, "User retrieved successfully");
    } catch (error) {
      return sendErrorResponse(res, error);
    }
  }

  static async create(req, res) {
    try {
      await Promise.all(validationRequestPost.map((v) => v.run(req)));
      const errors = validationResult(req);
      if (!errors.isEmpty()) return sendValidationError(res, errors);

      const { username, email, password, role, is_active } = req.body;

      const existingByUsername = await dataModel.findOne({ where: { username } });
      if (existingByUsername) {
        return sendConflictError(res, "User", "Username already exists");
      }

      const existingByEmail = await dataModel.findOne({ where: { email } });
      if (existingByEmail) {
        return sendConflictError(res, "User", "Email already exists");
      }

      const hashedPassword = await bcrypt.hash(password, BCRYPT_ROUNDS);

      const item = await dataModel.create({
        username,
        email,
        password: hashedPassword,
        role: role || "user",
        ...(is_active !== undefined && { is_active }),
      });

      await invalidateCache(req, cacheKeys.userListPattern());

      const { password: _password, ...safeUser } = item.toJSON();

      sendSuccessResponse(res, safeUser, "User created successfully", 201);
    } catch (error) {
      return sendErrorResponse(res, error);
    }
  }

  static async update(req, res) {
    await Promise.all(
      [...validateId, ...validationRequestUpdate].map((v) => v.run(req)),
    );
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return sendValidationError(res, errors.array());
    }

    try {
      const { id } = req.params;
      const { username, email, password, role, is_active } = req.body;

      const item = await dataModel.findByPk(id);
      if (!item) {
        return sendNotFoundError(res, "User");
      }

      if (username && username !== item.username) {
        const existingByUsername = await dataModel.findOne({ where: { username } });
        if (existingByUsername) {
          return sendConflictError(res, "User", "Username already exists");
        }
      }

      if (email && email !== item.email) {
        const existingByEmail = await dataModel.findOne({ where: { email } });
        if (existingByEmail) {
          return sendConflictError(res, "User", "Email already exists");
        }
      }
      console.log("USER ID: ", typeof req.user.id, "ID: ", typeof id);

      // DO not set status false of  the admin user
      if(req.user.id == id && is_active === false){
        return sendConflictError(res, "User", "You cannot disable your own account");
      }

      const updates = {
        ...(username !== undefined && { username }),
        ...(email !== undefined && { email }),
        ...(role !== undefined && { role }),
        ...(is_active !== undefined && { is_active }),
      };

      // Only re-hash/overwrite the password when one was actually supplied.
      if (password) {
        updates.password = await bcrypt.hash(password, BCRYPT_ROUNDS);
      }

      await item.update(updates);

      await invalidateCache(req, cacheKeys.userItem(id));
      await invalidateCache(req, cacheKeys.userListPattern());

      const { password: _password, ...safeUser } = item.toJSON();

      sendSuccessResponse(res, safeUser, "User updated successfully");
    } catch (error) {
      return sendErrorResponse(res, error);
    }
  }

  static async destroy(req, res) {
    await Promise.all(validateId.map((validation) => validation.run(req)));
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return sendValidationError(res, errors.array());
    }
    try {
      const { id } = req.params;

      if (req.user && Number(req.user.id) === Number(id)) {
        return sendConflictError(res, "User", "You cannot delete your own account");
      }

      const item = await dataModel.findByPk(id);
      if (!item) {
        return sendNotFoundError(res, "User");
      }

      await item.destroy();

      await invalidateCache(req, cacheKeys.userItem(id));
      await invalidateCache(req, cacheKeys.userListPattern());

      sendSuccessResponse(res, null, "User deleted successfully");
    } catch (error) {
      return sendErrorResponse(res, error);
    }
  }
}

module.exports = UserController;
