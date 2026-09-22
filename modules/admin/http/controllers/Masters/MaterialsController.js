const { models } = require("../../../../../database/models");
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
} = require("../../request/masters/materialsRequest");
const { validationResult } = require("express-validator");

const dataModel = models.Materials;

class MaterialsController {
  static async list(req, res) {
    try {
      const listCacheKey = cacheKeys.materialsList(req);
      const cached = await getCache(req, listCacheKey);
      if (cached) {
        return sendSuccessResponse(
          res,
          cached,
          "Materials list retrieved successfully from cache",
        );
      }

      const result = await paginate(dataModel, req, {
        order: [["sort_order", "ASC"]],
        searchFields: ["title", "slug"],
      });

      await setCache(req, listCacheKey, result);
      sendSuccessResponse(res, result, "Materials list retrieved successfully");
    } catch (error) {
      return sendErrorResponse(res, error);
    }
  }

  static async getActiveMaterials(req, res) {
    try {
      const listCacheKey = cacheKeys.materialsList(req);
      const cached = await getCache(req, listCacheKey);
      if (cached) {
        return sendSuccessResponse(
          res,
          cached,
          "Materials list retrieved successfully from cache",
        );
      }

      const result = await dataModel.findAll({
        where: { is_active: true },
        order: [["sort_order", "ASC"]],
        attributes: ["id", "title", "slug"],
      });

      await setCache(req, listCacheKey, result);
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
      const itemCacheKey = cacheKeys.materialsItem(id);
      const cached = await getCache(req, itemCacheKey);
      if (cached)
        return sendSuccessResponse(
          res,
          cached,
          "Material item retrieved successfully",
        );

      const item = await dataModel.findByPk(id);
      if (!item) return sendNotFoundError(res, "Material item");

      await setCache(req, itemCacheKey, item);
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

      await invalidateCache(req, cacheKeys.materialsListPattern());
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

      await invalidateCache(req, cacheKeys.materialsItem(id));
      await invalidateCache(req, cacheKeys.materialsListPattern());
      // Projects embed material title/id in their responses, so bust those too.
      await invalidateCache(req, cacheKeys.projectsListPattern());
      await invalidateCache(req, cacheKeys.projectsActivePattern());

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

      await invalidateCache(req, cacheKeys.materialsItem(id));
      await invalidateCache(req, cacheKeys.materialsListPattern());
      await invalidateCache(req, cacheKeys.projectsListPattern());
      await invalidateCache(req, cacheKeys.projectsActivePattern());

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
