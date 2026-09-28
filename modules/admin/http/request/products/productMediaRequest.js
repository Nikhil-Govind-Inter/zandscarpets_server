const { body, param } = require("express-validator");

const MEDIA_TYPES = ["image", "video"];

const validationRequestPost = [
  body("product_id")
    .notEmpty()
    .withMessage("Product is required")
    .isInt({ min: 1 })
    .withMessage("Product must be a valid ID"),
  body("media_type")
    .notEmpty()
    .withMessage("Media type is required")
    .isIn(MEDIA_TYPES)
    .withMessage(`Media type must be one of: ${MEDIA_TYPES.join(", ")}`),
  body("media_path")
    .optional({ nullable: true })
    .isString()
    .withMessage("Media path must be a string"),
  body("media_alt")
    .optional({ nullable: true })
    .isString()
    .withMessage("Media alt must be a string"),
  body("media_alt_ar")
    .optional({ nullable: true })
    .isString()
    .withMessage("Media alt (Arabic) must be a string"),
  body("sort_order")
    .notEmpty()
    .withMessage("Sort order is required")
    .isInt({ min: 0 })
    .withMessage("Sort order must be an integer"),
  body("is_active")
    .notEmpty()
    .withMessage("Is active is required")
    .isBoolean()
    .withMessage("Is active must be a boolean"),
];

const validateId = [
  param("id").isInt({ min: 1 }).withMessage("ID must be an integer"),
];

module.exports = { validationRequestPost, validateId, MEDIA_TYPES };