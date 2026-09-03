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
} = require("../../request/masters/projectsRequest");
const { validationResult } = require("express-validator");

const dataModel = models.Projects;
const fileFields = ["thumbnail", "media_path"];
const GALLERY_SUBFOLDER = "projects";

const relatedInclude = [
  { model: models.Industry, as: "category", attributes: ["id", "title"] },
  {
    model: dataModel,
    as: "relatedProjects",
    attributes: ["id", "title", "thumbnail"],
    through: { attributes: [] },
  },
];

// Multer normalizes single-file fields (thumbnail/media_path) via `fields`
// in the upload middleware, but a gallery field like project_media can carry
// several files under the same fieldname — those aren't in that `fields`
// list, so they land untouched in req.files.project_media as an array.
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

// Builds the final project_media array: existing paths the client asked to
// keep (filtered to ones actually under our upload subfolder, so bogus
// client input can't be smuggled into the column) plus any newly uploaded
// gallery files from this request.
const buildProjectMedia = (req) => {
  const kept = parseJsonArray(req.body.project_media).filter(
    (p) =>
      typeof p === "string" && p.startsWith(`uploads/${GALLERY_SUBFOLDER}/`),
  );
  const newFiles = (req.files?.project_media || []).map((f) =>
    f.path.replace(/\\/g, "/"),
  );
  return [...kept, ...newFiles];
};

const parseRelatedProjectIds = (value) => {
  if (value === undefined) return null;
  return parseJsonArray(value)
    .map((id) => Number(id))
    .filter((id) => Number.isInteger(id) && id > 0);
};

class ProjectsController {
  static async list(req, res) {
    try {
      const listCacheKey = cacheKeys.projectsList(req);
      const cached = await getCache(req, listCacheKey);
      if (cached) {
        return sendSuccessResponse(
          res,
          cached,
          "Project list retrieved successfully from cache",
        );
      }

      const result = await paginate(dataModel, req, {
        order: [["sort_order", "ASC"]],
        searchFields: ["title", "location", "material_type", "category.title"],
        include: [
          { model: models.Industry, as: "category", attributes: ["title"] },
        ],
      });

      await setCache(req, listCacheKey, result);
      sendSuccessResponse(res, result, "Project list retrieved successfully");
    } catch (error) {
      return sendErrorResponse(res, error);
    }
  }

  static async getActiveProjects(req, res) {
    try {
      const excludeId = parseInt(req.query.excludeId, 10);
      const where = { is_active: true };
      if (Number.isInteger(excludeId) && excludeId > 0) {
        where.id = { [Op.ne]: excludeId };
      }

      const result = await dataModel.findAll({
        where,
        order: [["sort_order", "ASC"]],
        attributes: ["id", "title", "thumbnail"],
      });

      sendSuccessResponse(res, result, "Project list retrieved successfully");
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
      const itemCacheKey = cacheKeys.projectsItem(id);
      const cached = await getCache(req, itemCacheKey);
      if (cached)
        return sendSuccessResponse(
          res,
          cached,
          "Project retrieved successfully",
        );

      const item = await dataModel.findByPk(id, { include: relatedInclude });
      if (!item) return sendNotFoundError(res, "Project");

      await setCache(req, itemCacheKey, item);
      sendSuccessResponse(res, item, "Project retrieved successfully");
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

      const relatedProjectIds = parseRelatedProjectIds(
        req.body.related_project_ids,
      );
      delete req.body.related_project_ids;
      req.body.project_media = buildProjectMedia(req);

      const item = await dataModel.create(req.body, { transaction: t });

      if (relatedProjectIds?.length) {
        await item.setRelatedProjects(relatedProjectIds, { transaction: t });
      }

      await t.commit();

      await invalidateCache(req, cacheKeys.projectsListPattern());
      await invalidateCache(req, cacheKeys.projectsActivePattern());

      const created = await dataModel.findByPk(item.id, {
        include: relatedInclude,
      });
      sendSuccessResponse(res, created, "Project created successfully", 201);
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
        return sendNotFoundError(res, "Project");
      }

      await handleFileUploadUpdate(req, item, fileFields);

      const relatedProjectIds = parseRelatedProjectIds(
        req.body.related_project_ids,
      );
      delete req.body.related_project_ids;

      const oldMedia = item.project_media || [];
      const newMedia = buildProjectMedia(req);
      req.body.project_media = newMedia;

      await item.update(req.body, { transaction: t });

      if (relatedProjectIds !== null) {
        await item.setRelatedProjects(relatedProjectIds, { transaction: t });
      }

      await t.commit();

      // Clean up gallery files dropped from the array (best-effort, after commit).
      const removed = oldMedia.filter((p) => !newMedia.includes(p));
      await Promise.all(removed.map((p) => deleteOldFile(p)));

      await invalidateCache(req, cacheKeys.projectsItem(id));
      await invalidateCache(req, cacheKeys.projectsListPattern());
      await invalidateCache(req, cacheKeys.projectsActivePattern());

      const updated = await dataModel.findByPk(id, {
        include: relatedInclude,
      });
      sendSuccessResponse(res, updated, "Project updated successfully");
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
        return sendNotFoundError(res, "Project");
      }

      await item.destroy({ transaction: t });

      await t.commit();

      await Promise.all(
        [item.thumbnail, item.media_path, ...(item.project_media || [])]
          .filter(Boolean)
          .map((p) => deleteOldFile(p)),
      );

      await invalidateCache(req, cacheKeys.projectsItem(id));
      await invalidateCache(req, cacheKeys.projectsListPattern());
      await invalidateCache(req, cacheKeys.projectsActivePattern());

      sendSuccessResponse(res, { id: id }, "Project deleted successfully");
    } catch (error) {
      await t.rollback();
      return sendErrorResponse(res, error);
    }
  }
}

module.exports = ProjectsController;
