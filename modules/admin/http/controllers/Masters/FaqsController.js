const { models } = require("../../../../../database/models");
const { sendSuccessResponse, sendErrorResponse, sendNotFoundError, sendValidationError } = require("../../traits/responseHandler");
const { paginate } = require("../../traits/datatablePaginationHelper");
const { validationRequestPost, validateId } = require("../../request/masters/faqsRequest");
const { validationResult } = require("express-validator");

const dataModel = models.Faqs;

const productInclude = [{ model: models.Products, as: "product", attributes: ["id", "title"] }];

// `product_id` query is either a numeric product id, the literal "global"
// (product_id IS NULL), or absent (all FAQs).
const buildProductWhere = (rawProductId) => {
  if (rawProductId === undefined || rawProductId === null || rawProductId === "") {
    return {};
  }
  if (rawProductId === "global") {
    return { product_id: null };
  }
  const productId = parseInt(rawProductId, 10);
  if (Number.isInteger(productId) && productId > 0) {
    return { product_id: productId };
  }
  return {};
};

class FaqsController {
  static async list(req, res) {
    try {
      const result = await paginate(dataModel, req, {
        where: buildProductWhere(req.query.product_id),
        order: [["sort_order", "ASC"]],
        searchFields: ["question", "answer", "$product.title$"],
        include: productInclude,
      });

      sendSuccessResponse(res, result, "Faqs list retrieved successfully");
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

      const item = await dataModel.findByPk(id, { include: productInclude });
      if (!item) return sendNotFoundError(res, "Faq item");

      sendSuccessResponse(res, item, "Faq item retrieved successfully");
    } catch (error) {
      return sendErrorResponse(res, error);
    }
  }

  static async create(req, res) {
    try {
      await Promise.all(validationRequestPost.map((v) => v.run(req)));
      const errors = validationResult(req);
      if (!errors.isEmpty()) return sendValidationError(res, errors);

      if (req.body.product_id) {
        const product = await models.Products.findByPk(req.body.product_id);
        if (!product) {
          return sendValidationError(res, [{ path: "product_id", msg: "Product not found" }]);
        }
      }

      const item = await dataModel.create(req.body);

      const created = await dataModel.findByPk(item.id, {
        include: productInclude,
      });
      sendSuccessResponse(res, created, "Faq item created successfully", 201);
    } catch (error) {
      return sendErrorResponse(res, error);
    }
  }

  static async update(req, res) {
    await Promise.all([...validateId, ...validationRequestPost].map((v) => v.run(req)));
    const errors = validationResult(req);
    if (!errors.isEmpty()) return sendValidationError(res, errors.array());

    try {
      const { id } = req.params;
      const item = await dataModel.findByPk(id);
      if (!item) return sendNotFoundError(res, "Faq item");

      if (req.body.product_id) {
        const product = await models.Products.findByPk(req.body.product_id);
        if (!product) {
          return sendValidationError(res, [{ path: "product_id", msg: "Product not found" }]);
        }
      }

      await item.update(req.body);

      const updated = await dataModel.findByPk(id, { include: productInclude });
      sendSuccessResponse(res, updated, "Faq item updated successfully");
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
      if (!item) return sendNotFoundError(res, "Faq item");

      await item.destroy();

      sendSuccessResponse(res, { id: id }, "Faq item deleted successfully");
    } catch (error) {
      return sendErrorResponse(res, error);
    }
  }
}

module.exports = FaqsController;
