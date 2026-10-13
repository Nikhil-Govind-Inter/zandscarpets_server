const { body, param } = require("express-validator");

const addFieldRequest = [
  param("productId").isInt({ min: 1 }).withMessage("Product ID must be an integer"),
  body("field_id").notEmpty().withMessage("field_id is required").isInt({ min: 1 }).withMessage("field_id must be an integer"),
  body("variant_id")
    .optional({ nullable: true })
    .isInt({ min: 1 })
    .withMessage("variant_id must be an integer"),
];

const reorderFieldsRequest = [
  param("productId").isInt({ min: 1 }).withMessage("Product ID must be an integer"),
  body("ordered_ids").isArray({ min: 1 }).withMessage("ordered_ids must be a non-empty array"),
];

const mappingIdParam = [param("mappingId").isInt({ min: 1 }).withMessage("Mapping ID must be an integer")];

const itemIdParam = [param("itemId").isInt({ min: 1 }).withMessage("Item ID must be an integer")];

const addItemRequest = [
  ...mappingIdParam,
  body("text_content").optional({ nullable: true }).isString().withMessage("text_content must be a string"),
  body("media_id").optional({ nullable: true }).isInt({ min: 1 }).withMessage("media_id must be an integer"),
  body("sort_order").optional({ nullable: true }).isInt({ min: 0 }).withMessage("sort_order must be an integer"),
];

const editItemRequest = [
  ...mappingIdParam,
  ...itemIdParam,
  body("text_content").optional({ nullable: true }).isString().withMessage("text_content must be a string"),
  body("media_id").optional({ nullable: true }).isInt({ min: 1 }).withMessage("media_id must be an integer"),
];

const reorderItemsRequest = [
  ...mappingIdParam,
  body("ordered_ids").isArray({ min: 1 }).withMessage("ordered_ids must be a non-empty array"),
];

const variantIdParam = [param("variantId").isInt({ min: 1 }).withMessage("Variant ID must be an integer")];
const fieldIdParam = [param("fieldId").isInt({ min: 1 }).withMessage("Field ID must be an integer")];

module.exports = {
  addFieldRequest,
  reorderFieldsRequest,
  mappingIdParam,
  itemIdParam,
  addItemRequest,
  editItemRequest,
  reorderItemsRequest,
  variantIdParam,
  fieldIdParam,
};
