const { body, param } = require("express-validator");

const validationRequestPost = [
  body("title")
    .notEmpty()
    .withMessage("Title is required")
    .isString()
    .withMessage("Title must be a string"),
  body("title_ar")
    .notEmpty()
    .withMessage("Title (Arabic) is required")
    .isString()
    .withMessage("Title (Arabic) must be a string"),
  body("slug")
    .notEmpty()
    .withMessage("Slug is required")
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

module.exports = { validationRequestPost, validateId };