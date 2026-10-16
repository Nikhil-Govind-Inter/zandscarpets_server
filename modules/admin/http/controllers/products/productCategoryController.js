const { Op } = require("sequelize");
const { sequelize, models } = require("../../../../../database/models");
const {
  generateSlug,
  generateUniqueSlug,
  assertNoDuplicate,
} = require("../../../../../utils/slugHelper");
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
  validationRequestPost,
  validateId,
} = require("../../request/products/productCategoryRequest");
const { validationResult } = require("express-validator");

const dataModel = models.ProductCategories;
const fileFields = ["media_path"];

const relatedInclude = [
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

const badgeInclude = {
  model: models.ProductLabels,
  as: "badge",
  attributes: ["id", "title", "title_ar", "slug", "is_product_badge"],
  required: false,
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
const parseHighlightIds = (value) => {
  if (value === undefined) return null;
  return parseJsonArray(value)
    .map((id) => Number(id))
    .filter((id) => Number.isInteger(id) && id > 0);
};

const parseOptionalId = (value) => {
  if (value === undefined) return undefined;
  if (value === null || value === "" || value === "null") return null;
  const id = Number(value);
  return Number.isInteger(id) && id > 0 ? id : null;
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

class ProductCategoryController {
  static async list(req, res) {
    try {
      const where = {};
      const parentId = parseInt(req.query.parent_id, 10);
      const status = req.query.status;
      const showInNavbar = req.query.show_in_navbar;
      const showInHome = req.query.show_in_home;
      if (status === "active") {
        where.is_active = true;
      } else if (status === "inactive") {
        where.is_active = false;
      }
      if (showInNavbar === "true") {
        where.show_in_navbar = true;
      } else if (showInNavbar === "false") {
        where.show_in_navbar = false;
      }
      if (showInHome === "true") {
        where.show_in_home = true;
      } else if (showInHome === "false") {
        where.show_in_home = false;
      }
      if (Number.isInteger(parentId) && parentId > 0) {
        where.parent_id = parentId;
      } else if (req.query.type === "category") {
        where.parent_id = null;
      } else if (req.query.type === "subcategory") {
        where.parent_id = { [Op.ne]: null };
      }

      const result = await paginate(dataModel, req, {
        where,
        order: [["sort_order", "ASC"]],
        searchFields: ["title", "title_ar", "slug"],
        include: [
          { model: dataModel, as: "parent", attributes: ["id", "title"] },
          {
            model: dataModel,
            as: "children",
            attributes: ["id"],
            required: false,
          },
        ],
      });

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
  // When `industry_id` is given, the list is scoped to categories mapped to
  // that industry via the industry_categories join (e.g. the Projects form's
  // dependent Category dropdown).
  static async getActive(req, res) {
    try {
      const excludeId = parseInt(req.query.excludeId, 10);
      const industryId = parseInt(req.query.industry_id, 10);

      const industryFilter =
        Number.isInteger(industryId) && industryId > 0
          ? [
              {
                model: models.Industry,
                as: "industries",
                where: { id: industryId },
                attributes: [],
                through: { attributes: [] },
              },
            ]
          : [];

      let result = await dataModel.findAll({
        where: { is_active: true },
        order: [["sort_order", "ASC"]],
        attributes: ["id", "title", "parent_id"],
        include: industryFilter,
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
      const item = await dataModel.findByPk(id, { include: [...relatedInclude, badgeInclude] });
      if (!item) return sendNotFoundError(res, "Product category");

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
      const badgeLabelId = parseOptionalId(req.body.badge_label_id);
      delete req.body.highlight_ids;
      delete req.body.badge_label_id;
      if (badgeLabelId) {
        const badge = await models.ProductLabels.findOne({
          where: { id: badgeLabelId, is_product_badge: true },
          transaction: t,
        });
        if (!badge) {
          await t.rollback();
          return sendValidationError(res, [
            { path: "badge_label_id", msg: "Badge label not found or not a badge" },
          ]);
        }
      }

      const slug = req.body.slug;
      if (!slug || !String(slug).trim()) {
        req.body.slug = await generateUniqueSlug(dataModel, req.body.title, {
          transaction: t,
        });
      } else {
        req.body.slug = generateSlug(slug);
        await assertNoDuplicate(dataModel, {
          field: "slug",
          value: req.body.slug,
          transaction: t,
        });
      }

      const item = await dataModel.create(
        { ...req.body, badge_label_id: badgeLabelId ?? null },
        { transaction: t },
      );

      if (highlightIds?.length) {
        await item.setHighlights(highlightIds, { transaction: t });
      }

      await t.commit();

      const created = await dataModel.findByPk(item.id, {
        include: [...relatedInclude, badgeInclude],
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
      const badgeLabelId = parseOptionalId(req.body.badge_label_id);
      delete req.body.highlight_ids;
      delete req.body.badge_label_id;
      if (badgeLabelId) {
        const badge = await models.ProductLabels.findOne({
          where: { id: badgeLabelId, is_product_badge: true },
          transaction: t,
        });
        if (!badge) {
          await t.rollback();
          return sendValidationError(res, [
            { path: "badge_label_id", msg: "Badge label not found or not a badge" },
          ]);
        }
      }

      if (badgeLabelId) {
        const badge = await models.ProductLabels.findOne({
          where: { id: badgeLabelId, is_product_badge: true },
          transaction: t,
        });
        if (!badge) {
          await t.rollback();
          return sendValidationError(res, [
            { path: "badge_label_id", msg: "Badge label not found or not a badge" },
          ]);
        }
      }

      const nextSlug = req.body.slug;
      if (!nextSlug || !String(nextSlug).trim()) {
        req.body.slug = await generateUniqueSlug(
          dataModel,
          req.body.title || item.title,
          { excludeId: id, transaction: t },
        );
      } else {
        req.body.slug = generateSlug(nextSlug);
        if (item.slug !== req.body.slug) {
          await assertNoDuplicate(dataModel, {
            field: "slug",
            value: req.body.slug,
            excludeId: id,
            transaction: t,
          });
        }
      }

      const updateData = { ...req.body };
      if (badgeLabelId !== undefined) updateData.badge_label_id = badgeLabelId;
      await item.update(updateData, { transaction: t });

      if (highlightIds !== null) {
        await item.setHighlights(highlightIds, { transaction: t });
      }

      await t.commit();

      const updated = await dataModel.findByPk(id, { include: [...relatedInclude, badgeInclude] });
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
