const { models } = require("../../../../../database/models");
const { deleteOldFile } = require("../../middleware/multerMiddleware");
const { sendSuccessResponse, sendErrorResponse, sendNotFoundError, sendValidationError } = require("../../traits/responseHandler");
const { paginate } = require("../../traits/datatablePaginationHelper");
const { validateProductId } = require("../../request/products/productDataSheetRequest");
const { validationResult } = require("express-validator");
const { Op } = require("sequelize");

const dataModel = models.Products;

class ProductDataSheetController {
  // Standalone "Data Sheets" admin section — products that currently have one attached.
  static async list(req, res) {
    try {
      const result = await paginate(dataModel, req, {
        where: { data_sheet_path: { [Op.ne]: null } },
        order: [["title", "ASC"]],
        searchFields: ["title"],
        attributes: ["id", "title", "data_sheet_path", "data_sheet_original_filename", "data_sheet_size_bytes", "data_sheet_mime_type", "updatedAt"],
      });

      sendSuccessResponse(res, result, "Product data sheets retrieved successfully");
    } catch (error) {
      return sendErrorResponse(res, error);
    }
  }

  static async getByProductId(req, res) {
    await Promise.all(validateProductId.map((v) => v.run(req)));
    const errors = validationResult(req);
    if (!errors.isEmpty()) return sendValidationError(res, errors.array());

    try {
      const { productId } = req.params;

      const product = await dataModel.findByPk(productId, {
        attributes: ["id", "title", "data_sheet_path", "data_sheet_original_filename", "data_sheet_size_bytes", "data_sheet_mime_type"],
      });
      if (!product) return sendNotFoundError(res, "Product");

      sendSuccessResponse(res, product, "Product data sheet retrieved successfully");
    } catch (error) {
      return sendErrorResponse(res, error);
    }
  }

  // Upload or replace (auto-replace — the old file is removed from disk).
  static async upsert(req, res) {
    await Promise.all(validateProductId.map((v) => v.run(req)));
    const errors = validationResult(req);
    if (!errors.isEmpty()) return sendValidationError(res, errors.array());

    try {
      const { productId } = req.params;
      const product = await dataModel.findByPk(productId);
      if (!product) return sendNotFoundError(res, "Product");

      const uploaded = req.files?.file_path?.[0];
      if (!uploaded) {
        return sendValidationError(res, [{ path: "file_path", msg: "A PDF file is required" }]);
      }

      if (product.data_sheet_path) {
        await deleteOldFile(product.data_sheet_path);
      }

      await product.update({
        data_sheet_path: req.body.file_path,
        data_sheet_original_filename: uploaded.originalname,
        data_sheet_size_bytes: uploaded.size,
        data_sheet_mime_type: uploaded.mimetype,
      });

      sendSuccessResponse(res, product, "Product data sheet saved successfully");
    } catch (error) {
      return sendErrorResponse(res, error);
    }
  }

  static async destroy(req, res) {
    await Promise.all(validateProductId.map((v) => v.run(req)));
    const errors = validationResult(req);
    if (!errors.isEmpty()) return sendValidationError(res, errors.array());

    try {
      const { productId } = req.params;
      const product = await dataModel.findByPk(productId);
      if (!product) return sendNotFoundError(res, "Product");

      if (product.data_sheet_path) await deleteOldFile(product.data_sheet_path);

      await product.update({
        data_sheet_path: null,
        data_sheet_original_filename: null,
        data_sheet_size_bytes: null,
        data_sheet_mime_type: null,
      });

      sendSuccessResponse(res, { id: productId }, "Product data sheet removed successfully");
    } catch (error) {
      return sendErrorResponse(res, error);
    }
  }
}

module.exports = ProductDataSheetController;
