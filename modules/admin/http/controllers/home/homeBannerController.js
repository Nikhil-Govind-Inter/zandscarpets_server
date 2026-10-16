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
  validationRequestPost,
  validateId,
} = require("../../request/home/homeBannerRequest");
const { validationResult } = require("express-validator");
const { Op } = require("sequelize");

const dataModel = models.HomeBanner;
const fileFields = ["media_path", "thumbnail"];

class HomeBannerController {
  static async list(req, res) {
    try {
      const result = await paginate(dataModel, req, {
        order: [["sort_order", "ASC"]],
        searchFields: ["title", "industry.title"],
        include: [
          { model: models.Industry, as: "industry", attributes: ["title"] },
        ],
      });

      sendSuccessResponse(res, result, "Home banner retrieved successfully");
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

      const item = await dataModel.findByPk(id, {
        include: [{ model: models.Industry, as: "industry" }],
      });
      if (!item) return sendNotFoundError(res, "Home banner");

      sendSuccessResponse(res, item, "Home banner retrieved successfully");
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
      const isItemExist = await dataModel.findOne({
        where: {
          industry_id: req.body.industry_id,
        },
        attrubutes: ["page_slug"],
        transaction: t,
      });

      if (isItemExist) throw `${isItemExist?.industry?.title} already exist`;

      handleFileUploadStore(req, fileFields);
      if (req.body.media_type !== "video") req.body.thumbnail = null;
      const item = await dataModel.create(req.body, { transaction: t });

      await t.commit();

      sendSuccessResponse(res, item, "Home banner created successfully", 201);
    } catch (error) {
      await t.rollback();
      return sendErrorResponse(res, error);
    }
  }

  static async update(req, res) {
    await Promise.all(
      [...validateId, ...validationRequestPost].map((v) => v.run(req)),
    );
    const errors = validationResult(req);
    if (!errors.isEmpty()) return sendValidationError(res, errors.array());

    const t = await sequelize.transaction();
    try {
      const { id } = req.params;
      const item = await dataModel.findByPk(id);
      if (!item) {
        await t.rollback();
        return sendNotFoundError(res, "Home banner");
      }

      const isItemExist = await dataModel.findOne({
        where: {
          industry_id: req.body.industry_id,
          id: {
            [Op.ne]: id,
          },
        },
        attrubutes: ["page_slug"],
        transaction: t,
      });

      if (isItemExist) throw `${req.body.page} already exist`;

      await handleFileUploadUpdate(req, item, fileFields);
      // Image banners carry no thumbnail; drop a stale one when switching.
      if (req.body.media_type !== "video") {
        req.body.thumbnail = null;
        if (item.thumbnail) await deleteOldFile(item.thumbnail);
      }
      await item.update(req.body, { transaction: t });

      await t.commit();

      sendSuccessResponse(res, item, "Home banner updated successfully");
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
        return sendNotFoundError(res, "Home banner");
      }

      await item.destroy({ transaction: t });

      await t.commit();

      if (item.media_path) await deleteOldFile(item.media_path);
      if (item.thumbnail) await deleteOldFile(item.thumbnail);

      sendSuccessResponse(res, { id: id }, "Home banner deleted successfully");
    } catch (error) {
      await t.rollback();
      return sendErrorResponse(res, error);
    }
  }
}

module.exports = HomeBannerController;
