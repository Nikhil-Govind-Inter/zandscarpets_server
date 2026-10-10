const { body, param } = require("express-validator");

const validationRequestPost = [
  body("attribute_id")
    .notEmpty()
    .withMessage("Attribute is required")
    .isInt({ min: 1 })
    .withMessage("Attribute must be a valid ID"),
  body("value")
    .optional({ checkFalsy: true })
    .isString()
    .withMessage("Value must be a string"),
  body("value_ar")
    .optional({ checkFalsy: true })
    .isString()
    .withMessage("Arabic value must be a string"),
  body("slug")
    .optional({ checkFalsy: true })
    .isString()
    .withMessage("Slug must be a string"),
  body("media_path")
    .optional({ checkFalsy: true })
    .isString()
    .withMessage("Media path must be a string"),
  body("media_alt")
    .optional({ checkFalsy: true })
    .isString()
    .withMessage("Media alt must be a string"),
  body("media_alt_ar")
    .optional({ checkFalsy: true })
    .isString()
    .withMessage("Arabic media alt must be a string"),
  body("color_code")
    .optional({ checkFalsy: true })
    .matches(/^#([0-9A-Fa-f]{3}|[0-9A-Fa-f]{6})$/)
    .withMessage("Color code must be a valid hex value (e.g. #FF0000)"),
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

module.exports = { validationRequestPost, validateId };