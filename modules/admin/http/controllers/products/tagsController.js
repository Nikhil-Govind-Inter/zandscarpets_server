const { sequelize, models } = require("../../../../../database/models");
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
} = require("../../request/products/tagsRequest");
const { validationResult } = require("express-validator");

const dataModel = models.Tags;

const invalidateAll = async (req, id) => {
  if (id) await invalidateCache(req, cacheKeys.tagsItem(id));
  await invalidateCache(req, cacheKeys.tagsListPattern());
};

class TagController {
  static async list(req, res) {
    try {
      const listCacheKey = cacheKeys.tagsList(req);
      const cached = await getCache(req, listCacheKey);
      if (cached) {
        return sendSuccessResponse(
          res,
          cached,
          "Tag list retrieved successfully from cache",
        );
      }

      const result = await paginate(dataModel, req, {
        where: {},
        order: [["sort_order", "ASC"]],
        searchFields: ["title", "title_ar"],
      });

      await setCache(req, listCacheKey, result);
      sendSuccessResponse(res, result, "Tag list retrieved successfully");
    } catch (error) {
      return sendErrorResponse(res, error);
    }
  }

  // Flat list for product form selects
  static async getActive(req, res) {
    try {
      const result = await dataModel.findAll({
        where: { is_active: true },
        order: [["sort_order", "ASC"]],
        attributes: ["id", "title", "title_ar"],
      });
      sendSuccessResponse(res, result, "Tag list retrieved successfully");
    } catch (error) {
      return sendErrorResponse(res, error);
    }
  }

  static async getById(req, res) {
    await Promise.all(validateId.map((v) => v.run(req)));
    const errors = validationResult(req);
    if (!errors.isEmpty()) return sendValidationError(res, errors.array());

    try {
      const { id } = req.params;
      const itemCacheKey = cacheKeys.tagsItem(id);
      const cached = await getCache(req, itemCacheKey);
      if (cached) {
        return sendSuccessResponse(res, cached, "Tag retrieved successfully");
      }

      const item = await dataModel.findByPk(id);
      if (!item) return sendNotFoundError(res, "Tag");

      await setCache(req, itemCacheKey, item);
      sendSuccessResponse(res, item, "Tag retrieved successfully");
    } catch (error) {
      return sendErrorResponse(res, error);
    }
  }

  static async create(req, res) {
    await Promise.all(validationRequestPost.map((v) => v.run(req)));
    const errors = validationResult(req);
    if (!errors.isEmpty()) return sendValidationError(res, errors.array());

    try {
      const item = await dataModel.create(req.body);
      await invalidateAll(req);
      sendSuccessResponse(res, item, "Tag created successfully", 201);
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
      if (!item) return sendNotFoundError(res, "Tag");

      await item.update(req.body);

      await invalidateAll(req, id);
      const updated = await dataModel.findByPk(id);
      sendSuccessResponse(res, updated, "Tag updated successfully");
    } catch (error) {
      return sendErrorResponse(res, error);
    }
  }

  static async destroy(req, res) {
    await Promise.all(validateId.map((v) => v.run(req)));
    const errors = validationResult(req);
    if (!errors.isEmpty()) return sendValidationError(res, errors.array());

    const t = await sequelize.transaction();
    try {
      const { id } = req.params;
      const item = await dataModel.findByPk(id, { transaction: t });
      if (!item) {
        await t.rollback();
        return sendNotFoundError(res, "Tag");
      }

      // products.tag_id is a plain FK, so block deletion while products use it.
      const productCount = await item.countProducts({ transaction: t });
      if (productCount > 0) {
        await t.rollback();
        return sendValidationError(res, [
          {
            path: "id",
            msg: "This tag is used by products. Remove it from them first.",
          },
        ]);
      }

      await item.destroy({ transaction: t });
      await t.commit();

      await invalidateAll(req, id);
      sendSuccessResponse(res, { id }, "Tag deleted successfully");
    } catch (error) {
      await t.rollback();
      return sendErrorResponse(res, error);
    }
  }
}

module.exports = TagController;