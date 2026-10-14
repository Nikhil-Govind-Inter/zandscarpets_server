const { models } = require("../../../../../database/models");
const {
  sendSuccessResponse,
  sendErrorResponse,
  sendNotFoundError,
  sendValidationError,
} = require("../../traits/responseHandler");
const {
  generateSlug,
  generateUniqueSlug,
  assertNoDuplicate,
} = require("../../../../../utils/slugHelper");
const { paginate } = require("../../traits/datatablePaginationHelper");
const { invalidateCache, cacheKeys } = require("../../traits/cacheHelper");
const {
  invalidateCache: invalidateFrontendCache,
  cacheKeys: frontendCacheKeys,
} = require("../../../../frontend/http/traits/cacheHelper");
const {
  validationRequestPost,
  validateId,
} = require("../../request/masters/industryRequest");
const { validationResult } = require("express-validator");

const dataModel = models.Industry;

const categoryInclude = {
  model: models.ProductCategories,
  as: "categories",
  attributes: ["id", "title", "title_ar", "slug"],
  through: { attributes: [] },
};

// null = field not sent (leave links untouched on update)
const parseCategoryIds = (value) => {
  if (value === undefined) return null;
  const arr = Array.isArray(value)
    ? value
    : typeof value === "string" && value.trim()
      ? (() => {
          try {
            const parsed = JSON.parse(value);
            return Array.isArray(parsed) ? parsed : [];
          } catch (_) {
            return [];
          }
        })()
      : [];
  return arr
    .map((id) => Number(id))
    .filter((id) => Number.isInteger(id) && id > 0);
};

class IndustryController {
  static async list(req, res) {
    try {
      const where = {};
      const status = req.query.status;
      if (status === "active") {
        where.is_active = true;
      } else if (status === "inactive") {
        where.is_active = false;
      }

      const result = await paginate(dataModel, req, {
        where,
        order: [["sort_order", "ASC"]],
        searchFields: ["title", "slug"],
        include: [categoryInclude],
      });

      sendSuccessResponse(res, result, "Industry list retrieved successfully");
    } catch (error) {
      return sendErrorResponse(res, error);
    }
  }

  static async getActiveIndustries(req, res) {
    try {
      const result = await dataModel.findAll({
        where: { is_active: true },
        order: [["sort_order", "ASC"]],
        attributes: ["id", "title", "slug"],
      });

      sendSuccessResponse(res, result, "Industry list retrieved successfully");
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
      const item = await dataModel.findByPk(id, { include: [categoryInclude] });
      if (!item) return sendNotFoundError(res, "Industry item");

      sendSuccessResponse(res, item, "Industry item retrieved successfully");
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

      if (!slug || !String(slug).trim()) {
        req.body.slug = await generateUniqueSlug(dataModel, req.body.title);
      } else {
        req.body.slug = generateSlug(slug);
        await assertNoDuplicate(dataModel, {
          field: "slug",
          value: req.body.slug,
        });
      }

      const categoryIds = parseCategoryIds(req.body.category_ids);
      delete req.body.category_ids;

      const item = await dataModel.create(req.body);

      if (categoryIds?.length) {
        await item.setCategories(categoryIds);
      }

      await invalidateCache(req, cacheKeys.industryListPattern());
      await invalidateFrontendCache(req, frontendCacheKeys.servicesPattern());
      sendSuccessResponse(res, item, "Industry item created successfully", 201);
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
      if (!item) return sendNotFoundError(res, "Industry item");

      const nextSlug = req.body.slug;
      if (!nextSlug || !String(nextSlug).trim()) {
        req.body.slug = await generateUniqueSlug(dataModel, req.body.title || item.title, {
          excludeId: id,
        });
      } else {
        req.body.slug = generateSlug(nextSlug);
        if (item.slug !== req.body.slug) {
          await assertNoDuplicate(dataModel, {
            field: "slug",
            value: req.body.slug,
            excludeId: id,
          });
        }
      }

      const categoryIds = parseCategoryIds(req.body.category_ids);
      delete req.body.category_ids;

      await item.update(req.body);

      if (categoryIds !== null) {
        await item.setCategories(categoryIds);
      }

      await invalidateCache(req, cacheKeys.industryItem(id));
      await invalidateCache(req, cacheKeys.industryListPattern());
      await invalidateFrontendCache(req, frontendCacheKeys.servicesPattern());

      const updated = await dataModel.findByPk(id, { include: [categoryInclude] });
      sendSuccessResponse(res, updated, "Industry item updated successfully");
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
      if (!item) return sendNotFoundError(res, "Industry item");

      // Paranoid delete keeps the row, so drop the category links explicitly.
      await item.setCategories([]);
      await item.destroy();

      await invalidateCache(req, cacheKeys.industryItem(id));
      await invalidateCache(req, cacheKeys.industryListPattern());
      await invalidateFrontendCache(req, frontendCacheKeys.servicesPattern());

      sendSuccessResponse(
        res,
        { id: id },
        "Industry item deleted successfully",
      );
    } catch (error) {
      return sendErrorResponse(res, error);
    }
  }
}

module.exports = IndustryController;
