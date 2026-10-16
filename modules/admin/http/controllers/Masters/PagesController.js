const { models } = require("../../../../../database/models");
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
} = require("../../request/masters/pagesRequest");
const { validationResult } = require("express-validator");
const { Op } = require("sequelize");

const dataModel = models.Page;

class PagesController {
  static async list(req, res) {
    try {
      const result = await paginate(dataModel, req, {
        order: [["page", "ASC"]],
        searchFields: ["page", "page_slug"],
      });

      sendSuccessResponse(res, result, "Pages list retrieved successfully");
    } catch (error) {
      return sendErrorResponse(res, error);
    }
  }

  static async getActivePages(req, res) {
    try {
      const result = await dataModel.findAll({
        where: {
          is_active: true,
        },
        order: [["page", "ASC"]],
      });

      sendSuccessResponse(res, result, "Pages list retrieved successfully");
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

      const item = await dataModel.findByPk(id);
      if (!item) return sendNotFoundError(res, "Page item");

      sendSuccessResponse(res, item, "Page item retrieved successfully");
    } catch (error) {
      return sendErrorResponse(res, error);
    }
  }

  static async create(req, res) {
    try {
      await Promise.all(validationRequestPost.map((v) => v.run(req)));
      const errors = validationResult(req);
      if (!errors.isEmpty()) return sendValidationError(res, errors);

      const isItemExist = await dataModel.findOne({
        where: { page_slug: req.body.page_slug, deleted_at: null },
        attrubutes: ["page_slug"],
      });
      if (isItemExist)
        return sendErrorResponse(res, `${req.body.page} already exist`);

      const item = await dataModel.create(req.body);

      sendSuccessResponse(res, item, "Page item created successfully", 201);
    } catch (error) {
      return sendErrorResponse(res, error);
    }
  }

  static async update(req, res) {
    await Promise.all(
      [...validateId, ...validationRequestPost].map((v) => v.run(req)),
    );
    const errors = validationResult(req);
    if (!errors.isEmpty()) return sendValidationError(res, errors.array());

    try {
      const { id } = req.params;
      const item = await dataModel.findByPk(id);
      if (!item) return sendNotFoundError(res, "Page item");

      // except current id

      const isItemExist = await dataModel.findOne({
        where: {
          page_slug: req.body.page_slug,
          id: {
            [Op.ne]: id,
          },
        },
        attrubutes: ["page_slug"],
      });

      if (isItemExist)
        return sendErrorResponse(res, `${req.body.page} already exist`);

      await item.update(req.body);

      sendSuccessResponse(res, item, "Page item updated successfully");
    } catch (error) {
      return sendErrorResponse(res, error);
    }
  }

  static async destroy(req, res) {
    await Promise.all(validateId.map((validation) => validation.run(req)));
    const errors = validationResult(req);
    if (!errors.isEmpty()) return sendValidationError(res, errors.array());

    try {
      const { id } = req.params;
      const item = await dataModel.findByPk(id);
      if (!item) return sendNotFoundError(res, "Page item");

      await item.destroy();

      sendSuccessResponse(res, { id: id }, "Page item deleted successfully");
    } catch (error) {
      return sendErrorResponse(res, error);
    }
  }
}

module.exports = PagesController;
