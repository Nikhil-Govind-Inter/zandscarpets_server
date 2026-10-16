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
} = require("../../request/masters/materialsRequest");
const { validationResult } = require("express-validator");

const dataModel = models.Materials;

class MaterialsController {
  static async list(req, res) {
    try {
      const result = await paginate(dataModel, req, {
        order: [["sort_order", "ASC"]],
        searchFields: ["title", "slug"],
      });

      sendSuccessResponse(res, result, "Materials list retrieved successfully");
    } catch (error) {
      return sendErrorResponse(res, error);
    }
  }

  static async getActiveMaterials(req, res) {
    try {
      const result = await dataModel.findAll({
        where: { is_active: true },
        order: [["sort_order", "ASC"]],
        attributes: ["id", "title", "slug"],
      });

      sendSuccessResponse(res, result, "Materials list retrieved successfully");
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
      if (!item) return sendNotFoundError(res, "Material item");

      sendSuccessResponse(res, item, "Material item retrieved successfully");
    } catch (error) {
      return sendErrorResponse(res, error);
    }
  }

  static async create(req, res) {
    try {
      await Promise.all(validationRequestPost.map((v) => v.run(req)));
      const errors = validationResult(req);
      if (!errors.isEmpty()) return sendValidationError(res, errors);

      const { slug } = req.body;

      const isItemExist = await dataModel.findOne({
        where: { slug: slug },
        attributes: ["slug"],
      });
      if (isItemExist)
        return sendErrorResponse(res, `${req.body.title} already exist`);

      const item = await dataModel.create(req.body);

      sendSuccessResponse(res, item, "Material item created successfully", 201);
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
      if (!item) return sendNotFoundError(res, "Material item");

      if (item.slug !== req.body.slug) {
        const isItemExist = await dataModel.findOne({
          where: { slug: req.body.slug },
          attributes: ["slug"],
        });
        if (isItemExist)
          return sendErrorResponse(res, `${req.body.title} already exist`);
      }

      await item.update(req.body);

      // Projects embed material title/id in their responses, so bust those too.

      sendSuccessResponse(res, item, "Material item updated successfully");
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
      if (!item) return sendNotFoundError(res, "Material item");

      await item.destroy();

      sendSuccessResponse(
        res,
        { id: id },
        "Material item deleted successfully",
      );
    } catch (error) {
      return sendErrorResponse(res, error);
    }
  }
}

module.exports = MaterialsController;
