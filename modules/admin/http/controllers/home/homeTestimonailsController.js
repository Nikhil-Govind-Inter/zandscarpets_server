const { sequelize, models } = require("../../../../../database/models");
const {
  handleFileUploadUpdate,
  deleteOldFile,
  handleFileUploadStore,
} = require("../../middleware/multerMiddleware");
const {
  sendSuccessResponse,
  sendErrorResponse,
  sendNotFoundError,
  sendValidationError,
} = require("../../traits/responseHandler");
const { paginate } = require("../../traits/datatablePaginationHelper");
const {
  getCache,
  setCache,
  invalidateCache,
  cacheKeys,
} = require("../../traits/cacheHelper");
const {
  validationRequestPost,
  validateId,
} = require("../../request/home/homeTestimonailsRequest");
const { validationResult } = require("express-validator");

const dataModel = models.HomeTestimonials;
const fileFields = ["profile_media_path"];

class HomeTestimonialsController {
  static async list(req, res) {
    try {
      const listCacheKey = cacheKeys.homeTestimonialsList(req);
      const cached = await getCache(req, listCacheKey);
      if (cached) {
        return sendSuccessResponse(res, cached, "Home testimonials retrieved successfully from cache");
      }

      const result = await paginate(dataModel, req, {
        order: [["sort_order", "ASC"]],
        searchFields: ["name", "designation"],
      });

      await setCache(req, listCacheKey, result);
      sendSuccessResponse(res, result, "Home testimonials retrieved successfully");
    } catch (error) {
      return sendErrorResponse(res, error);
    }
  }

  static async getById(req, res) {
    await Promise.all(validateId.map((validation) => validation.run(req)));
    const errors = validationResult(req);
    if (!errors.isEmpty()) return sendValidationError(res, errors.array());

    try {
      const { id } = req.params;
      const itemCacheKey = cacheKeys.homeTestimonialsItem(id);
      const cached = await getCache(req, itemCacheKey);
      if (cached) return sendSuccessResponse(res, cached, "Home testimonial retrieved successfully");

      const item = await dataModel.findByPk(id);
      if (!item) return sendNotFoundError(res, "Home testimonial");

      await setCache(req, itemCacheKey, item);
      sendSuccessResponse(res, item, "Home testimonial retrieved successfully");
    } catch (error) {
      return sendErrorResponse(res, error);
    }
  }

  static async create(req, res) {
    await Promise.all(validationRequestPost.map((v) => v.run(req)));
    const errors = validationResult(req);
    if (!errors.isEmpty()) return sendValidationError(res, errors);

    const t = await sequelize.transaction();
    try {
      handleFileUploadStore(req, fileFields);
      const item = await dataModel.create(req.body, { transaction: t });

      await t.commit();

      await invalidateCache(req, cacheKeys.homeTestimonialsListPattern());
      sendSuccessResponse(res, item, "Home testimonial created successfully", 201);
    } catch (error) {
      await t.rollback();
      return sendErrorResponse(res, error);
    }
  }

  static async update(req, res) {
    await Promise.all([...validateId, ...validationRequestPost].map((v) => v.run(req)));
    const errors = validationResult(req);
    if (!errors.isEmpty()) return sendValidationError(res, errors.array());

    const t = await sequelize.transaction();
    try {
      const { id } = req.params;
      const item = await dataModel.findByPk(id);
      if (!item) {
        await t.rollback();
        return sendNotFoundError(res, "Home testimonial");
      }

      await handleFileUploadUpdate(req, item, fileFields);
      await item.update(req.body, { transaction: t });

      await t.commit();

      await invalidateCache(req, cacheKeys.homeTestimonialsItem(id));
      await invalidateCache(req, cacheKeys.homeTestimonialsListPattern());

      sendSuccessResponse(res, item, "Home testimonial updated successfully");
    } catch (error) {
      await t.rollback();
      return sendErrorResponse(res, error);
    }
  }

  static async destroy(req, res) {
    await Promise.all(validateId.map((validation) => validation.run(req)));
    const errors = validationResult(req);
    if (!errors.isEmpty()) return sendValidationError(res, errors.array());

    const t = await sequelize.transaction();
    try {
      const { id } = req.params;
      const item = await dataModel.findByPk(id);
      if (!item) {
        await t.rollback();
        return sendNotFoundError(res, "Home testimonial");
      }

      await item.destroy({ transaction: t });

      await t.commit();

      if (item.profile_media_path) await deleteOldFile(item.profile_media_path);

      await invalidateCache(req, cacheKeys.homeTestimonialsItem(id));
      await invalidateCache(req, cacheKeys.homeTestimonialsListPattern());

      sendSuccessResponse(res, { id: id }, "Home testimonial deleted successfully");
    } catch (error) {
      await t.rollback();
      return sendErrorResponse(res, error);
    }
  }
}

module.exports = HomeTestimonialsController;
