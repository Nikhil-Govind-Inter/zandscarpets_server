const { body, param } = require("express-validator");

const validationRequestPost = [
  body("parent_id")
    .optional({ checkFalsy: true })
    .isInt({ min: 1 })
    .withMessage("Parent category must be a valid ID"),
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
    .optional({ checkFalsy: true })
    .isString()
    .withMessage("Slug must be a string"),
  body("description")
    .optional({ checkFalsy: true })
    .isString()
    .withMessage("Description must be a string"),
  body("description_ar")
    .optional({ checkFalsy: true })
    .isString()
    .withMessage("Description (Arabic) must be a string"),
  body("material_type")
    .optional({ checkFalsy: true })
    .isString()
    .withMessage("Material type must be a string"),
  body("material_type_ar")
    .optional({ checkFalsy: true })
    .isString()
    .withMessage("Material type (Arabic) must be a string"),
  body("media_path")
    .optional({ checkFalsy: true })
    .isString()
    .withMessage("Media path must be a string"),
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
  body("show_in_navbar")
    .optional()
    .isBoolean()
    .withMessage("Show in navbar must be a boolean"),
  body("show_in_home")
    .optional()
    .isBoolean()
    .withMessage("Show in home must be a boolean"),
];

const validateId = [
  param("id").isInt({ min: 1 }).withMessage("ID must be an integer"),
];

module.exports = {
  validationRequestPost,
  validateId,
};
