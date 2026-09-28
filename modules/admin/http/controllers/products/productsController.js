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
} = require("../../request/products/productsRequest");
const { validationResult } = require("express-validator");

const dataModel = models.Products;
const fileFields = ["media_path", "data_sheet"];

const listInclude = [
  {
    model: models.ProductCategories,
    as: "category",
    attributes: ["id", "title"],
  },
  { model: models.Tags, as: "tag", attributes: ["id", "title", "title_ar"] },
];

const detailInclude = [
  {
    model: models.ProductCategories,
    as: "category",
    attributes: ["id", "title", "title_ar"],
  },
  { model: models.Tags, as: "tag", attributes: ["id", "title", "title_ar"] },
  {
    model: models.Colors,
    as: "colors",
    attributes: ["id", "title", "title_ar", "media_path"],
    through: { attributes: [] },
  },
  {
    model: models.Size,
    as: "sizes",
    attributes: ["id", "title", "title_ar"],
    through: { attributes: [] },
  },
  {
    model: models.ProductTags,
    as: "hash_tags",
    attributes: ["id", "title", "title_ar"],
    through: { attributes: [] },
  },
  {
    model: dataModel,
    as: "relatedProducts",
    attributes: ["id", "title", "title_ar", "slug", "media_path", "price"],
    through: { attributes: [] },
  },
  { model: models.ProductFaq, as: "productFaq", required: false },
  { model: models.ProductMedia, as: "productMedia", required: false },
];

const detailOrder = [
  [{ model: models.ProductFaq, as: "productFaq" }, "sort_order", "ASC"],
  [{ model: models.ProductMedia, as: "productMedia" }, "sort_order", "ASC"],
];

// Only rolls back if the transaction is still open.
const safeRollback = async (t) => {
  if (t && !t.finished) await t.rollback();
};

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
const parseIds = (value) => {
  if (value === undefined) return null;
  return [
    ...new Set(
      parseJsonArray(value)
        .map((id) => Number(id))
        .filter((id) => Number.isInteger(id) && id > 0),
    ),
  ];
};

// true when every id exists (soft-deleted rows don't count)
const allExist = async (model, ids, transaction) => {
  if (!ids || !ids.length) return true;
  const count = await model.count({ where: { id: ids }, transaction });
  return count === ids.length;
};

const slugTaken = async (slug, ignoreId, transaction) => {
  const where = { slug };
  if (ignoreId) where.id = { [Op.ne]: Number(ignoreId) };
  return !!(await dataModel.findOne({ where, transaction }));
};

// FormData sends an empty tag as "" and arrays as JSON strings.
const normalizeBody = (req, { isCreate }) => {
  const raw = req.body.tag_id;
  req.body.tag_id =
    raw === undefined || raw === null || raw === "" || raw === "null"
      ? null
      : Number(raw);

  ["specification", "specification_ar"].forEach((field) => {
    if (req.body[field] !== undefined) {
      req.body[field] = parseJsonArray(req.body[field]);
    } else if (isCreate) {
      req.body[field] = [];
    }
  });
};

const invalidateAll = async (req, id) => {
  if (id) await invalidateCache(req, cacheKeys.productsItem(id));
  await invalidateCache(req, cacheKeys.productsListPattern());
};

// Runs the checks shared by create and update. Returns an error array or null.
const validateRelations = async (req, ids, ignoreId, t) => {
  const { color_ids, size_ids, hash_tag_ids, related_product_ids } = ids;

  if (await slugTaken(req.body.slug, ignoreId, t)) {
    return [{ path: "slug", msg: "Slug is already in use" }];
  }

  const category = await models.ProductCategories.findByPk(
    req.body.product_category_id,
    { transaction: t },
  );
  if (!category) {
    return [{ path: "product_category_id", msg: "Category not found" }];
  }

  if (
    req.body.tag_id &&
    !(await models.Tags.findByPk(req.body.tag_id, { transaction: t }))
  ) {
    return [{ path: "tag_id", msg: "Tag not found" }];
  }

  if (!(await allExist(models.Colors, color_ids, t))) {
    return [{ path: "color_ids", msg: "One or more colors not found" }];
  }
  if (!(await allExist(models.Size, size_ids, t))) {
    return [{ path: "size_ids", msg: "One or more sizes not found" }];
  }
  if (!(await allExist(models.ProductTags, hash_tag_ids, t))) {
    return [{ path: "hash_tag_ids", msg: "One or more hash tags not found" }];
  }

  // A product cannot be related to itself.
  if (ignoreId && related_product_ids?.includes(Number(ignoreId))) {
    return [
      {
        path: "related_product_ids",
        msg: "A product cannot be related to itself",
      },
    ];
  }
  if (!(await allExist(dataModel, related_product_ids, t))) {
    return [
      {
        path: "related_product_ids",
        msg: "One or more related products not found",
      },
    ];
  }

  const { specification, specification_ar } = req.body;
  if (
    Array.isArray(specification) &&
    Array.isArray(specification_ar) &&
    specification.length !== specification_ar.length
  ) {
    return [
      {
        path: "specification_ar",
        msg: "Specification and Arabic specification must have the same number of items",
      },
    ];
  }

  return null;
};

const readIds = (req) => {
  const ids = {
    color_ids: parseIds(req.body.color_ids),
    size_ids: parseIds(req.body.size_ids),
    hash_tag_ids: parseIds(req.body.hash_tag_ids),
    related_product_ids: parseIds(req.body.related_product_ids),
  };
  delete req.body.color_ids;
  delete req.body.size_ids;
  delete req.body.hash_tag_ids;
  delete req.body.related_product_ids;
  return ids;
};

// null = not sent, so leave existing links alone
const syncLinks = async (item, ids, t) => {
  if (ids.color_ids !== null)
    await item.setColors(ids.color_ids, { transaction: t });
  if (ids.size_ids !== null)
    await item.setSizes(ids.size_ids, { transaction: t });
  if (ids.hash_tag_ids !== null)
    await item.setHash_tags(ids.hash_tag_ids, { transaction: t });
  if (ids.related_product_ids !== null)
    await item.setRelatedProducts(ids.related_product_ids, { transaction: t });
};

// Cache cleanup must never turn a saved change into a failed request.
const safeInvalidate = async (req, id) => {
  try {
    await invalidateAll(req, id);
  } catch (e) {
    console.error("Cache invalidation failed:", e);
  }
};

class ProductController {
  static async list(req, res) {
    try {
      const listCacheKey = cacheKeys.productsList(req);
      const cached = await getCache(req, listCacheKey);
      // if (cached) {
      //   return sendSuccessResponse(
      //     res,
      //     cached,
      //     "Product list retrieved successfully from cache",
      //   );
      // }

      const where = {};
      const categoryId = parseInt(req.query.product_category_id, 10);
      const tagId = parseInt(req.query.tag_id, 10);
      if (Number.isInteger(categoryId) && categoryId > 0) {
        where.product_category_id = categoryId;
      }
      if (Number.isInteger(tagId) && tagId > 0) where.tag_id = tagId;

      const result = await paginate(dataModel, req, {
        where,
        order: [["sort_order", "ASC"]],
        searchFields: ["title", "title_ar", "slug"],
        include: listInclude,
      });

      await setCache(req, listCacheKey, result);
      sendSuccessResponse(res, result, "Product list retrieved successfully");
    } catch (error) {
      return sendErrorResponse(res, error);
    }
  }

  // Flat list for selects (for example related products)
  static async getActive(req, res) {
    try {
      const excludeId = parseInt(req.query.excludeId, 10);
      const where = { is_active: true };
      if (Number.isInteger(excludeId) && excludeId > 0) {
        where.id = { [Op.ne]: excludeId };
      }
      const result = await dataModel.findAll({
        where,
        order: [["sort_order", "ASC"]],
        attributes: ["id", "title", "title_ar", "slug", "media_path", "price"],
      });
      sendSuccessResponse(res, result, "Product list retrieved successfully");
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
      const itemCacheKey = cacheKeys.productsItem(id);
      const cached = await getCache(req, itemCacheKey);
      if (cached) {
        return sendSuccessResponse(
          res,
          cached,
          "Product retrieved successfully",
        );
      }

      const item = await dataModel.findByPk(id, {
        include: detailInclude,
        order: detailOrder,
      });
      if (!item) return sendNotFoundError(res, "Product");

      await setCache(req, itemCacheKey, item);
      sendSuccessResponse(res, item, "Product retrieved successfully");
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
      normalizeBody(req, { isCreate: true });
      const ids = readIds(req);

      const relationErrors = await validateRelations(req, ids, null, t);
      if (relationErrors) {
        await safeRollback(t);
        return sendValidationError(res, relationErrors);
      }

      const item = await dataModel.create(req.body, { transaction: t });
      await syncLinks(item, ids, t);

      await t.commit();
      await safeInvalidate(req);

      const created = await dataModel.findByPk(item.id, {
        include: detailInclude,
        order: detailOrder,
      });
      sendSuccessResponse(res, created, "Product created successfully", 201);
    } catch (error) {
      console.error("Product create failed:", error);
      await safeRollback(t);
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
        await safeRollback(t);
        return sendNotFoundError(res, "Product");
      }

      normalizeBody(req, { isCreate: false });
      const ids = readIds(req);

      const relationErrors = await validateRelations(req, ids, id, t);
      if (relationErrors) {
        await safeRollback(t);
        return sendValidationError(res, relationErrors);
      }

      await handleFileUploadUpdate(req, item, fileFields);
      await item.update(req.body, { transaction: t });
      await syncLinks(item, ids, t);

      await t.commit();
      await safeInvalidate(req, id);

      const updated = await dataModel.findByPk(id, {
        include: detailInclude,
        order: detailOrder,
      });
      sendSuccessResponse(res, updated, "Product updated successfully");
    } catch (error) {
      console.error("Product update failed:", error);
      await safeRollback(t);
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
        await safeRollback(t);
        return sendNotFoundError(res, "Product");
      }

      // Paranoid delete keeps the row, so clear links and soft-delete children.
      await item.setColors([], { transaction: t });
      await item.setSizes([], { transaction: t });
      await item.setHash_tags([], { transaction: t });
      await item.setRelatedProducts([], { transaction: t });

      // Also remove rows where OTHER products list this one as related.
      const RelatedThrough = dataModel.associations.relatedProducts.through.model;
      await RelatedThrough.destroy({
        where: { related_product_id: id },
        transaction: t,
      });

      await models.ProductFaq.destroy({
        where: { product_id: id },
        transaction: t,
      });
      await models.ProductMedia.destroy({
        where: { product_id: id },
        transaction: t,
      });
      await item.destroy({ transaction: t });

      await t.commit();

      await deleteOldFile(item.media_path);
      await deleteOldFile(item.data_sheet);
      await safeInvalidate(req, id);

      sendSuccessResponse(res, { id }, "Product deleted successfully");
    } catch (error) {
      console.error("Product delete failed:", error);
      await safeRollback(t);
      return sendErrorResponse(res, error);
    }
  }
}

module.exports = ProductController;