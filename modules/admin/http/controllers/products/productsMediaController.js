const { models } = require("../../../../../database/models");
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
  getCache,
  setCache,
  invalidateCache,
  cacheKeys,
} = require("../../traits/cacheHelper");
const {
  validationRequestPost,
  validateId,
  MEDIA_TYPES,
} = require("../../request/products/productMediaRequest");
const { validationResult } = require("express-validator");

const dataModel = models.ProductMedia;
const fileFields = ["media_path", "thumbnail"];

const productInclude = [
  { model: models.Products, as: "product", attributes: ["id", "title"] },
];


const invalidateAll = async (req, id) => {
  if (id) await invalidateCache(req, cacheKeys.productMediaItem(id));
  await invalidateCache(req, cacheKeys.productMediaListPattern());
  // Product responses embed this resource, so drop cached products too.
  await invalidateCache(req, "admin:cache:products:*");
};

class ProductMediaController {
  static async list(req, res) {
    try {
      const listCacheKey = cacheKeys.productMediaList(req);
      const cached = await getCache(req, listCacheKey);
      if (cached) {
        return sendSuccessResponse(
          res,
          cached,
          "Product media list retrieved successfully from cache",
        );
      }

      const where = {};
      const productId = parseInt(req.query.product_id, 10);
      if (Number.isInteger(productId) && productId > 0) {
        where.product_id = productId;
      }
      if (MEDIA_TYPES.includes(req.query.media_type)) {
        where.media_type = req.query.media_type;
      }

      const result = await paginate(dataModel, req, {
        where,
        order: [
          ["sort_order", "ASC"],
          ["id", "ASC"],
        ],
        searchFields: ["media_alt", "media_alt_ar"],
        include: productInclude,
      });

      await setCache(req, listCacheKey, result);
      sendSuccessResponse(
        res,
        result,
        "Product media list retrieved successfully",
      );
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
      const itemCacheKey = cacheKeys.productMediaItem(id);
      const cached = await getCache(req, itemCacheKey);
      if (cached) {
        return sendSuccessResponse(
          res,
          cached,
          "Product media retrieved successfully",
        );
      }

      const item = await dataModel.findByPk(id, { include: productInclude });
      if (!item) return sendNotFoundError(res, "Product media");

      await setCache(req, itemCacheKey, item);
      sendSuccessResponse(res, item, "Product media retrieved successfully");
    } catch (error) {
      return sendErrorResponse(res, error);
    }
  }

  static async create(req, res) {
    try {
      await Promise.all(validationRequestPost.map((v) => v.run(req)));
      const errors = validationResult(req);
      if (!errors.isEmpty()) return sendValidationError(res, errors.array());

      const product = await models.Products.findByPk(req.body.product_id);
      if (!product) {
        return sendValidationError(res, [
          { path: "product_id", msg: "Product not found" },
        ]);
      }

      handleFileUploadStore(req, fileFields);
      // Only videos carry a thumbnail.
      if (req.body.media_type !== "video") req.body.thumbnail = null;

      const item = await dataModel.create(req.body);
      await invalidateAll(req);

      const created = await dataModel.findByPk(item.id, {
        include: productInclude,
      });
      sendSuccessResponse(
        res,
        created,
        "Product media created successfully",
        201,
      );
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
      if (!item) return sendNotFoundError(res, "Product media");

      const product = await models.Products.findByPk(req.body.product_id);
      if (!product) {
        return sendValidationError(res, [
          { path: "product_id", msg: "Product not found" },
        ]);
      }

      // Only videos carry a thumbnail, so drop it when switching to an image.
      if (req.body.media_type !== "video") {
        if (item.thumbnail) await deleteOldFile(item.thumbnail);
        req.body.thumbnail = null;
        await handleFileUploadUpdate(req, item, ["media_path"]);
      } else {
        await handleFileUploadUpdate(req, item, fileFields);
      }

      await item.update(req.body);
      await invalidateAll(req, id);

      const updated = await dataModel.findByPk(id, { include: productInclude });
      sendSuccessResponse(res, updated, "Product media updated successfully");
    } catch (error) {
      return sendErrorResponse(res, error);
    }
  }

  static async destroy(req, res) {
    await Promise.all(validateId.map((v) => v.run(req)));
    const errors = validationResult(req);
    if (!errors.isEmpty()) return sendValidationError(res, errors.array());

    try {
      const { id } = req.params;
      const item = await dataModel.findByPk(id);
      if (!item) return sendNotFoundError(res, "Product media");

      for (const field of fileFields) {
        if (item[field]) await deleteOldFile(item[field]);
      }

      await item.destroy();
      await invalidateAll(req, id);

      sendSuccessResponse(res, { id }, "Product media deleted successfully");
    } catch (error) {
      return sendErrorResponse(res, error);
    }
  }
}

module.exports = ProductMediaController;