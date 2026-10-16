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
} = require("../../request/siteSettings/bannerRequest");
const { validationResult } = require("express-validator");
const { Op } = require("sequelize");

const dataModel = models.Banners;
const fileFields = ["media_path"];

class BannerController {
  static async list(req, res) {
    try {
      const result = await paginate(dataModel, req, {
        order: [["id", "ASC"]],
        // page title
        searchFields: ["title", "sub_title", "page.page"],
        include: [{ model: models.Page, as: "page", attributes: ["page"] }],
      });

      sendSuccessResponse(res, result, "Banners list retrieved successfully");
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
        include: [{ model: models.Page, as: "page" }],
      });
      if (!item) return sendNotFoundError(res, "Banner item");

      sendSuccessResponse(res, item, "Banner item retrieved successfully");
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
        where: { page_id: req.body.page_id },
        include: [{ model: models.Page, as: "page" }],
        attrubutes: ["page_id"],
        transaction: t,
      });
      if (isItemExist)
        throw `${isItemExist?.page?.page} banner already exist`;

      handleFileUploadStore(req, fileFields);

      const item = await dataModel.create(req.body, { transaction: t });

      await t.commit();

      sendSuccessResponse(res, item, "Banner item created successfully", 201);
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
        return sendNotFoundError(res, "Banner item");
      }

      // IT SHOULD except currwnt edit id

      const isItemExist = await dataModel.findOne({
        where: {
          page_id: req.body.page_id,
          id: {
            [Op.ne]: req.params.id,
          },
        },
        include: [
          {
            model: models.Page,
            as: "page",
            attributes: ["page"],
          },
        ],
        attributes: ["id", "page_id"],
        transaction: t,
      });

      if (isItemExist)
        throw `${isItemExist?.page?.page} banner already exist`;

      await handleFileUploadUpdate(req, item, fileFields);
      await item.update(req.body, { transaction: t });

      await t.commit();

      sendSuccessResponse(res, item, "Banner item updated successfully");
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
        return sendNotFoundError(res, "Banner item");
      }

      await item.destroy({ transaction: t });

      await t.commit();

      if (item.media_path) await deleteOldFile(item.media_path);

      sendSuccessResponse(res, { id: id }, "Banner item deleted successfully");
    } catch (error) {
      await t.rollback();
      return sendErrorResponse(res, error);
    }
  }
}

module.exports = BannerController;