const { Op } = require("sequelize");
const { sequelize, models } = require("../../../../../database/models");
const {
  handleFileUploadUpdate,
  handleFileUploadStore,
  deleteOldFile,
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
} = require("../../request/products/productCategoryRequest");
const { validationResult } = require("express-validator");

const dataModel = models.ProductCategories;
const fileFields = ["media_path"];

const relatedInclude = [
  { model: models.Industry, as: "industry", attributes: ["id", "title"] },
  { model: dataModel, as: "parent", attributes: ["id", "title"] },
  {
    model: dataModel,
    as: "children",
    attributes: ["id", "title", "is_active"],
    required: false,
  },
  {
    model: models.ProductHighlights,
    as: "highlights",
    attributes: ["id", "title", "title_ar", "is_active"],
    through: { attributes: [] },
  },
];

const parseJsonArray = (value) => {
  if (Array.isArray(value)) return value;
  if (typeof value === "string" && value.trim()) {
    try {
      const parsed = JSON.parse(value);
      return Array.isArray(parsed) ? parsed : [];
    } catch (_) {
      return [];
    }
  }
  return [];
};

// null = field not sent (leave links untouched on update)
const parseHighlightIds = (value) => {
  if (value === undefined) return null;
  return parseJsonArray(value)
    .map((id) => Number(id))
    .filter((id) => Number.isInteger(id) && id > 0);
};

// Ids of every category below `rootId` in the tree (children, grandchildren, ...).
const getDescendantIds = async (rootId, transaction) => {
  const rows = await dataModel.findAll({
    attributes: ["id", "parent_id"],
    paranoid: false,
    transaction,
  });
  const byParent = new Map();
  rows.forEach((r) => {
    if (r.parent_id == null) return;
    if (!byParent.has(r.parent_id)) byParent.set(r.parent_id, []);
    byParent.get(r.parent_id).push(r.id);
  });

  const result = new Set();
  const stack = [Number(rootId)];
  while (stack.length) {
    const current = stack.pop();
    (byParent.get(current) || []).forEach((childId) => {
      if (!result.has(childId)) {
        result.add(childId);
        stack.push(childId);
      }
    });
  }
  return result;
};

// FormData sends an empty parent as "" — normalize to null (top-level).
const normalizeParentId = (req) => {
  const raw = req.body.parent_id;
  req.body.parent_id =
    raw === undefined || raw === null || raw === "" || raw === "null"
      ? null
      : Number(raw);
};

const invalidateAll = async (req, id) => {
  if (id) await invalidateCache(req, cacheKeys.productCategoriesItem(id));
  // Parent/child data is embedded in other categories' items, so bust them all.
  await invalidateCache(req, cacheKeys.productCategoriesItemPattern());
  await invalidateCache(req, cacheKeys.productCategoriesListPattern());
};

class ProductCategoryController {
  static async list(req, res) {
    try {
      const listCacheKey = cacheKeys.productCategoriesList(req);
      const cached = await getCache(req, listCacheKey);
      if (cached) {
        return sendSuccessResponse(
          res,
          cached,
          "Product category list retrieved successfully from cache",
        );
      }

      const where = {};
      const parentId = parseInt(req.query.parent_id, 10);
      const industryId = parseInt(req.query.industry_id, 10);
      if (Number.isInteger(parentId) && parentId > 0) {
        where.parent_id = parentId;
      } else if (req.query.type === "category") {
        where.parent_id = null;
      } else if (req.query.type === "subcategory") {
        where.parent_id = { [Op.ne]: null };
      }
      if (Number.isInteger(industryId) && industryId > 0) {
        where.industry_id = industryId;
      }

      const result = await paginate(dataModel, req, {
        where,
        order: [["sort_order", "ASC"]],
        searchFields: ["title", "title_ar"],
        include: [
          { model: models.Industry, as: "industry", attributes: ["id", "title"] },
          { model: dataModel, as: "parent", attributes: ["id", "title"] },
          {
            model: dataModel,
            as: "children",
            attributes: ["id"],
            required: false,
          },
        ],
      });

      await setCache(req, listCacheKey, result);
      sendSuccessResponse(
        res,
        result,
        "Product category list retrieved successfully",
      );
    } catch (error) {
      return sendErrorResponse(res, error);
    }
  }

  // Flat list for parent selects. When `excludeId` is given, that category and
  // its whole subtree are left out so a category can't become its own ancestor.
  static async getActive(req, res) {
    try {
      const excludeId = parseInt(req.query.excludeId, 10);
      let result = await dataModel.findAll({
        where: { is_active: true },
        order: [["sort_order", "ASC"]],
        attributes: ["id", "title", "parent_id", "industry_id"],
      });

      if (Number.isInteger(excludeId) && excludeId > 0) {
        const excluded = await getDescendantIds(excludeId);
        excluded.add(excludeId);
        result = result.filter((c) => !excluded.has(c.id));
      }

      sendSuccessResponse(
        res,
        result,
        "Product category list retrieved successfully",
      );
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
      const itemCacheKey = cacheKeys.productCategoriesItem(id);
      const cached = await getCache(req, itemCacheKey);
      if (cached)
        return sendSuccessResponse(
          res,
          cached,
          "Product category retrieved successfully",
        );

      const item = await dataModel.findByPk(id, { include: relatedInclude });
      if (!item) return sendNotFoundError(res, "Product category");

      await setCache(req, itemCacheKey, item);
      sendSuccessResponse(res, item, "Product category retrieved successfully");
    } catch (error) {
      return sendErrorResponse(res, error);
    }
  }

  static async create(req, res) {
    await Promise.all(validationRequestPost.map((v) => v.run(req)));
    const errors = validationResult(req);
    if (!errors.isEmpty()) return sendValidationError(res, errors.array());

    const t = await sequelize.transaction();
    try {
      handleFileUploadStore(req, fileFields);
      normalizeParentId(req);

      if (req.body.parent_id) {
        const parent = await dataModel.findByPk(req.body.parent_id, {
          transaction: t,
        });
        if (!parent) {
          await t.rollback();
          return sendValidationError(res, [
            { path: "parent_id", msg: "Parent category not found" },
          ]);
        }
      }

      const highlightIds = parseHighlightIds(req.body.highlight_ids);
      delete req.body.highlight_ids;

      const item = await dataModel.create(req.body, { transaction: t });

      if (highlightIds?.length) {
        await item.setHighlights(highlightIds, { transaction: t });
      }

      await t.commit();
      await invalidateAll(req);

      const created = await dataModel.findByPk(item.id, {
        include: relatedInclude,
      });
      sendSuccessResponse(
        res,
        created,
        "Product category created successfully",
        201,
      );
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
      const item = await dataModel.findByPk(id, { transaction: t });
      if (!item) {
        await t.rollback();
        return sendNotFoundError(res, "Product category");
      }

      normalizeParentId(req);

      if (req.body.parent_id) {
        const descendants = await getDescendantIds(id, t);
        if (req.body.parent_id === item.id || descendants.has(req.body.parent_id)) {
          await t.rollback();
          return sendValidationError(res, [
            {
              path: "parent_id",
              msg: "A category cannot be its own parent or a child of its own sub-category",
            },
          ]);
        }
        const parent = await dataModel.findByPk(req.body.parent_id, {
          transaction: t,
        });
        if (!parent) {
          await t.rollback();
          return sendValidationError(res, [
            { path: "parent_id", msg: "Parent category not found" },
          ]);
        }
      }

      await handleFileUploadUpdate(req, item, fileFields);

      const highlightIds = parseHighlightIds(req.body.highlight_ids);
      delete req.body.highlight_ids;

      await item.update(req.body, { transaction: t });

      if (highlightIds !== null) {
        await item.setHighlights(highlightIds, { transaction: t });
      }

      await t.commit();
      await invalidateAll(req, id);

      const updated = await dataModel.findByPk(id, { include: relatedInclude });
      sendSuccessResponse(res, updated, "Product category updated successfully");
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
      const item = await dataModel.findByPk(id, { transaction: t });
      if (!item) {
        await t.rollback();
        return sendNotFoundError(res, "Product category");
      }

      const childCount = await dataModel.count({
        where: { parent_id: id },
        transaction: t,
      });
      if (childCount > 0) {
        await t.rollback();
        return sendValidationError(res, [
          {
            path: "id",
            msg: "This category has sub-categories. Delete or move them first.",
          },
        ]);
      }

      // Paranoid delete keeps the row, so drop the highlight links explicitly.
      await item.setHighlights([], { transaction: t });
      await item.destroy({ transaction: t });

      await t.commit();

      await deleteOldFile(item.media_path);
      await invalidateAll(req, id);

      sendSuccessResponse(
        res,
        { id: id },
        "Product category deleted successfully",
      );
    } catch (error) {
      await t.rollback();
      return sendErrorResponse(res, error);
    }
  }
}

module.exports = ProductCategoryController;
